import {AlertCircle,X} from "lucide-react";
import {Alert,AlertDescription} from "@/components/ui/alert";

interface ValidationAlertProps { 
    message: string;
    onClose: () => void;
}
export  function ValidationAlert({message, onClose}:ValidationAlertProps) {
    return (
<Alert variant="destructive" className="mt-4 animate-in fade-in slide-in-from-top-1"> 
    <AlertCircle className="h-4 w-4" />
    <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-2">
            <X className="h-4 w-4" />
        </button>
    </AlertDescription>

</Alert>
  )
}
