import { toast } from "sonner"

type ToastProps = {
    title?: string
    description?: string
    variant?: "default" | "destructive"
    [key: string]: any
}

export function useToast() {
    return {
        toast: ({ title, description, variant, ...props }: ToastProps) => {
            if (variant === "destructive") {
                toast.error(title, { description, ...props })
            } else {
                toast(title, { description, ...props })
            }
        },
        dismiss: (id?: string | number) => toast.dismiss(id),
    }
}
