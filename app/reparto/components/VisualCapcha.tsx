"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, AlertCircle, CheckCircle2, RotateCw, RotateCcw } from "lucide-react"

interface VisualCaptchaProps {
  isOpen: boolean
  onVerify: (success: boolean) => void
  onClose: () => void
}

type ChallengeType = "imageMatch" | "patternMatch" | "sequenceMatch" | "rotationMatch"

interface Challenge {
  type: ChallengeType
  question: string
  target: string
  options: string[]
  correctAnswer: number[] | number
  timeLimit?: number
  initialRotation?: number
}

const ANIMALS = [
  {
    name: "gallina",
    target: "/captcha/gallina.jpg",
    distractors: ["/captcha/gato.jpg", "/captcha/vaca.jpg", "/captcha/oveja.jpg"],
  },
  {
    name: "gato",
    target: "/captcha/gato.jpg",
    distractors: ["/captcha/gallina.jpg", "/captcha/vaca.jpg", "/captcha/oveja.jpg"],
  },
  {
    name: "vaca",
    target: "/captcha/vaca.jpg",
    distractors: ["/captcha/gato.jpg", "/captcha/gallina.jpg", "/captcha/oveja.jpg"],
  },
  {
    name: "oveja",
    target: "/captcha/oveja.jpg",
    distractors: ["/captcha/gato.jpg", "/captcha/vaca.jpg", "/captcha/gallina.jpg"],
  },
]

const getRandomAnimalChallenge = (): Challenge => {
  const randomAnimal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  const options = [...randomAnimal.distractors, randomAnimal.target]

  return {
    type: "imageMatch",
    question: "Selecciona la fotografía que muestra el mismo animal del dibujo",
    target: randomAnimal.target,
    options: options,
    correctAnswer: 3,
    timeLimit: 20,
  }
}

const getRandomRotation = () => {
  const rotations = [90, 180, 270]
  return rotations[Math.floor(Math.random() * rotations.length)]
}

const CHALLENGES: Challenge[] = [
  {
    type: "patternMatch",
    question: "Selecciona los símbolos en el orden correcto. Haz clic de nuevo en un símbolo para deseleccionarlo.",
    target: "/captcha/pattern1.jpg",
    options: ["/captcha/symbol1.jpg", "/captcha/symbol2.jpg", "/captcha/symbol3.jpg", "/captcha/symbol4.jpg"],
    correctAnswer: [0, 1, 2, 3],
    timeLimit: 30,
  },
  {
    type: "rotationMatch",
    question: "Gira la imagen hasta que coincida con la orientación correcta",
    target: "/captcha/rotate-target.jpg",
    options: ["/captcha/rotate-image.jpg"],
    correctAnswer: 0,
    timeLimit: 25,
  },
]

function shuffleArray<T>(array: T[]): { shuffled: T[]; indices: number[] } {
  const shuffled = [...array]
  const indices = Array.from({ length: array.length }, (_, i) => i)

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  return { shuffled, indices }
}

export function VisualCaptcha({ isOpen, onVerify, onClose }: VisualCaptchaProps) {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([])
  const [shuffleIndices, setShuffleIndices] = useState<number[]>([])
  const [selectedAnswers, setSelectedAnswers] = useState<{ index: number; order: number }[]>([])
  const [rotation, setRotation] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const timerRef = useRef<NodeJS.Timeout>()
  const maxAttempts = 3

  const getRandomChallenge = useCallback(() => {
    const challengeTypes = ["animal", "pattern", "rotation"]
    const selectedType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)]

    let challenge: Challenge

    if (selectedType === "animal") {
      challenge = getRandomAnimalChallenge()
    } else if (selectedType === "pattern") {
      challenge = { ...CHALLENGES[0] }
    } else {
      challenge = {
        ...CHALLENGES[1],
        initialRotation: getRandomRotation(),
      }
    }

    const { shuffled, indices } = shuffleArray(challenge.options)

    if (challenge.type === "imageMatch") {
      challenge.correctAnswer = indices.indexOf(3)
    }

    return { challenge, shuffled, indices }
  }, [])

  const resetChallenge = useCallback(() => {
    const { challenge, shuffled, indices } = getRandomChallenge()

    setCurrentChallenge(challenge)
    setShuffledOptions(shuffled)
    setShuffleIndices(indices)
    setSelectedAnswers([])
    setTimeLeft(challenge.timeLimit || null)
    setFeedback(null)

    if (challenge.type === "rotationMatch" && challenge.initialRotation) {
      setRotation(challenge.initialRotation)
    } else {
      setRotation(0)
    }
  }, [getRandomChallenge])

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = undefined
    }
  }, [])

  const startTimer = useCallback(() => {
    clearTimer()
    if (!currentChallenge?.timeLimit) return

    setTimeLeft(currentChallenge.timeLimit)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (!prev || prev <= 1) {
          clearTimer()
          setFeedback({
            type: "error",
            message: "Se acabó el tiempo. Intentalo de nuevo.",
          })
          setTimeout(resetChallenge, 1500)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [clearTimer, currentChallenge, resetChallenge])

  useEffect(() => {
    if (isOpen) {
      resetChallenge()
    } else {
      setCurrentChallenge(null)
      setSelectedAnswers([])
      setTimeLeft(null)
      setAttempts(0)
      setFeedback(null)
      clearTimer()
    }
  }, [isOpen, resetChallenge, clearTimer])

  useEffect(() => {
    if (currentChallenge?.timeLimit) {
      startTimer()
    }
    return clearTimer
  }, [currentChallenge, startTimer, clearTimer])

  const handleImageClick = useCallback(
    (index: number) => {
      if (!currentChallenge) return

      setSelectedAnswers((prev) => {
        if (currentChallenge.type === "imageMatch") {
          return [{ index, order: 1 }]
        }

        const existingSelection = prev.find((a) => a.index === index)
        if (existingSelection) {
          const newAnswers = prev.filter((a) => a.index !== index)
          return newAnswers.map((a, i) => ({
            ...a,
            order: i + 1,
          }))
        }

        if (prev.length >= 4) {
          return prev
        }

        return [...prev, { index, order: prev.length + 1 }]
      })
    },
    [currentChallenge],
  )

  const verifyAnswer = useCallback(() => {
    if (!currentChallenge) return

    setIsLoading(true)
    clearTimer()

    let isCorrect = false
    switch (currentChallenge.type) {
      case "imageMatch":
        isCorrect = selectedAnswers.length === 1 && selectedAnswers[0].index === currentChallenge.correctAnswer
        break
      case "patternMatch": {
        if (selectedAnswers.length !== 4) {
          isCorrect = false
          break
        }

        const userSequence = selectedAnswers
          .sort((a, b) => a.order - b.order)
          .map((answer) => shuffleIndices[answer.index])

        isCorrect =
          Array.isArray(currentChallenge.correctAnswer) &&
          userSequence.length === currentChallenge.correctAnswer.length &&
          userSequence.every((value, index) => value === (currentChallenge.correctAnswer as number[])[index])
        break
      }
      case "rotationMatch":
        isCorrect = rotation === 0
        break
    }

    if (isCorrect) {
      setFeedback({
        type: "success",
        message: "¡Verificación exitosa!",
      })
      setTimeout(() => {
        onVerify(true)
      }, 1000)
    } else {
      const newAttempts = attempts + 1
      setAttempts(newAttempts)

      if (newAttempts >= maxAttempts) {
        setFeedback({
          type: "error",
          message: "Demasiados intentos fallidos",
        })
        setTimeout(() => {
          onVerify(false)
        }, 1500)
      } else {
        setFeedback({
          type: "error",
          message: "Incorrecto, intenta de nuevo",
        })
        setTimeout(resetChallenge, 1500)
      }
    }
    setIsLoading(false)
  }, [currentChallenge, selectedAnswers, rotation, attempts, onVerify, resetChallenge, clearTimer, shuffleIndices])

  if (!currentChallenge) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[320px] px-6 py-5" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="space-y-1 pb-2 px-1">
          <DialogTitle className="flex items-center justify-between text-lg">
            Verificación de Seguridad
            {timeLeft !== null && (
              <span
                className={`px-2 py-1 text-sm rounded-md ${timeLeft < 10 ? "bg-red-100 text-red-600" : "bg-gray-100"}`}
              >
                {timeLeft}s{" "}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentChallenge?.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-2"
          >
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-sm text-gray-600 mb-2">{currentChallenge?.question}</p>

              <motion.div className="relative mx-auto w-[140px] h-[140px] mb-2">
                <Image
                  src={currentChallenge?.target || "/placeholder.svg"}
                  alt="Imagen objetivo"
                  fill
                  className="object-contain"
                />
              </motion.div>
            </div>

            <div
              className={`grid ${
                currentChallenge?.type === "rotationMatch" ? "grid-cols-1 gap-3" : "grid-cols-2 gap-2"
              } justify-center items-center mx-auto`}
            >
              {currentChallenge?.type === "rotationMatch" ? (
                <div className="space-y-3">
                  <div className="relative mx-auto w-[140px] h-[140px]">
                    <motion.div
                      style={{
                        width: "100%",
                        height: "100%",
                        rotate: rotation,
                        transition: "rotate 0.3s ease",
                      }}
                      className="relative"
                    >
                      <Image
                        src={shuffledOptions[0] || "/placeholder.svg"}
                        alt="Imagen para rotar"
                        fill
                        className="object-contain"
                      />
                    </motion.div>
                  </div>
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setRotation((prev) => (prev - 90) % 360)}
                      className="rounded-full h-8 w-8"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setRotation((prev) => (prev + 90) % 360)}
                      className="rounded-full h-8 w-8"
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                shuffledOptions.map((src, index) => (
                  <motion.button
                    key={src}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleImageClick(index)}
                    className={`relative border rounded-lg transition-all ${
                      selectedAnswers.some((a) => a.index === index)
                        ? "border-red-600 ring-1 ring-red-600"
                        : "hover:border-red-500"
                    } w-[90px] h-[90px]`}
                  >
                    <div className="absolute inset-0 p-1">
                      <Image
                        src={src || "/placeholder.svg"}
                        alt={`Opción ${index + 1}`}
                        fill
                        className="rounded-md object-contain"
                      />
                      {selectedAnswers.find((a) => a.index === index) && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-medium">
                          {selectedAnswers.find((a) => a.index === index)?.order}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))
              )}
            </div>

            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex items-center p-2 rounded-md text-sm ${
                    feedback.type === "success" ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 mr-2 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  )}
                  <span className="text-sm">{feedback.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {attempts > 0 && (
              <p className="text-xs text-gray-500 text-center">
                Intento {attempts} de {maxAttempts}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} className="h-9">
                Cancelar
              </Button>
              <Button
                onClick={verifyAnswer}
                disabled={isLoading || (currentChallenge?.type !== "rotationMatch" && selectedAnswers.length === 0)}
                className="h-9 bg-red-600 hover:bg-red-700"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verificar"}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}

