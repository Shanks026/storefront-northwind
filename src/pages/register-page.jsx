import { useState } from "react"
import { Link, useSearchParams } from "react-router"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { MIN_PASSWORD, validateCredentials } from "@/api/auth"
import { AuthLayout } from "@/components/auth/auth-layout"
import { FormField } from "@/components/auth/form-field"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useSignUp } from "@/hooks/use-auth"
import { withRedirect } from "./login-page"

export function RegisterPage() {
  const [params] = useSearchParams()
  const signUp = useSignUp()
  const [values, setValues] = useState({ name: "", email: "", password: "" })
  const [errors, setErrors] = useState({})

  const set = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }))
    if (errors[field]) setErrors((err) => ({ ...err, [field]: undefined }))
  }

  function submit(e) {
    e.preventDefault()
    const clientErrors = validateCredentials(values, { requireName: true })
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length) return

    // on success <GuestOnly> sends the user to ?redirect (or home)
    signUp.mutate(values, {
      onSuccess: ({ user }) => toast.success(`Welcome, ${user.name.split(" ")[0]}!`, { description: "Your account is ready." }),
      onError: (err) => setErrors(err.fields ?? {}),
    })
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to={withRedirect("/login", params)} className="font-semibold text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-4">
        {signUp.isError && !signUp.error.fields && (
          <Alert variant="destructive">
            <AlertDescription>{signUp.error.message}</AlertDescription>
          </Alert>
        )}
        <FormField label="Full name" autoComplete="name" value={values.name} onChange={set("name")} error={errors.name} autoFocus />
        <FormField label="Email" type="email" autoComplete="email" value={values.email} onChange={set("email")} error={errors.email} />
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={set("password")}
          error={errors.password}
          hint={`At least ${MIN_PASSWORD} characters.`}
        />
        <Button type="submit" className="h-10 w-full" disabled={signUp.isPending}>
          {signUp.isPending && <Loader2 className="animate-spin" />}
          {signUp.isPending ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Demo store: your account is saved only in this browser&apos;s local storage.
        </p>
      </form>
    </AuthLayout>
  )
}
