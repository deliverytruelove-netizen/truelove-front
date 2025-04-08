import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar skeleton */}
      <div className="hidden lg:block w-64 bg-white shadow-lg">
        <div className="flex items-center justify-center h-16 border-b">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-32 ml-3" />
        </div>
        <div className="mt-6 px-3 space-y-3">
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar skeleton */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b">
          <div className="flex items-center">
            <Skeleton className="h-10 w-64 rounded-md" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>

        {/* Main content skeleton */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-10 w-32 mt-4 md:mt-0" />
            </div>

            {/* Stats cards skeleton */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-32" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tabs skeleton */}
            <div className="mt-6">
              <div className="flex gap-2 mb-6">
                <Skeleton className="h-10 w-32 rounded-md" />
                <Skeleton className="h-10 w-32 rounded-md" />
                <Skeleton className="h-10 w-32 rounded-md" />
              </div>

              {/* Orders skeleton */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24 rounded-full" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex gap-2">
                          <Skeleton className="h-4 w-4 mt-1" />
                          <div className="w-full">
                            <Skeleton className="h-4 w-32 mb-1" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Skeleton className="h-3 w-16 mb-1" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                          <div>
                            <Skeleton className="h-3 w-16 mb-1" />
                            <Skeleton className="h-4 w-8" />
                          </div>
                          <div>
                            <Skeleton className="h-3 w-16 mb-1" />
                            <Skeleton className="h-4 w-12" />
                          </div>
                        </div>
                        <Skeleton className="h-9 w-full rounded-md" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
