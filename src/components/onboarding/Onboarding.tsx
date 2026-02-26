import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Check, Cloud, HardDrive, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTodoStore } from '@/store/use-todo-store'
import type { StorageMode } from '@/lib/storage/types'
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { ENABLE_CLOUD_FEATURES } from '@/config/features'

type OnboardingStep = 'welcome' | 'storage-choice' | 'cloud-setup'
type CloudMode = 'signup' | 'signin'

interface OnboardingProps {
  onComplete: () => void
}

// Composant Stepper
function Stepper({ currentStep, t }: { currentStep: number; t: (key: string) => string }) {
  const steps = [
    { number: 1, label: t('onboarding.stepWelcome') },
    { number: 2, label: t('onboarding.stepStorage') },
    { number: 3, label: t('onboarding.stepConfiguration') }
  ]

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                currentStep === step.number
                  ? 'bg-primary text-primary-foreground'
                  : currentStep > step.number
                  ? 'bg-green-500 text-white'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {currentStep > step.number ? (
                <Check className="h-4 w-4" />
              ) : (
                step.number
              )}
            </div>
            <span className="text-xs mt-1 text-muted-foreground">{step.label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-12 h-0.5 mx-2 mb-5 transition-colors',
                currentStep > step.number ? 'bg-green-500' : 'bg-muted'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useTranslation()
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [cloudMode, setCloudMode] = useState<CloudMode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { setStorageMode, signUp, signIn } = useTodoStore()

  const getStepNumber = (): number => {
    switch (step) {
      case 'welcome': return 1
      case 'storage-choice': return 2
      case 'cloud-setup': return 3
    }
  }

  const handleStorageChoice = (mode: StorageMode) => {
    if (mode === 'local') {
      handleLocalSetup()
    } else {
      // Si le cloud est désactivé, forcer le mode local
      if (!ENABLE_CLOUD_FEATURES) {
        handleLocalSetup()
      } else {
        setStep('cloud-setup')
      }
    }
  }

  const handleLocalSetup = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await setStorageMode('local')
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('onboarding.errorConfig'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloudAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validation email
    if (!email.includes('@')) {
      setError(t('onboarding.errorInvalidEmail'))
      return
    }

    // Validation password
    if (password.length < 6) {
      setError(t('onboarding.errorPasswordLength'))
      return
    }

    // Validation confirmPassword (uniquement pour signup)
    if (cloudMode === 'signup' && password !== confirmPassword) {
      setError(t('onboarding.errorPasswordMismatch'))
      return
    }

    setIsLoading(true)

    try {
      // Passer en mode cloud d'abord
      await setStorageMode('cloud')
      
      // Créer le compte ou se connecter
      if (cloudMode === 'signup') {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
      
      // Succès !
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : t(cloudMode === 'signup' ? 'onboarding.errorSignup' : 'onboarding.errorSignin'))
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'welcome') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <img 
                src="/app-icon.png" 
                alt="Todo Overlay Logo" 
                className="h-20 w-20 rounded-2xl shadow-lg"
              />
            </div>
            <Stepper currentStep={getStepNumber()} t={t} />
            <CardTitle className="text-3xl">{t('onboarding.welcomeTitle')}</CardTitle>
            <CardDescription className="text-base">
              {t('onboarding.welcomeDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-accent/50">
                <Check className="h-8 w-8 text-green-500 mb-3" />
                <p className="font-medium mb-1">{t('onboarding.featureMinimalist')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('onboarding.featureMinimalistDesc')}
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-accent/50">
                <Check className="h-8 w-8 text-green-500 mb-3" />
                <p className="font-medium mb-1">{t('onboarding.featureShortcut')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('onboarding.featureShortcutDesc')}
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-accent/50">
                <Check className="h-8 w-8 text-green-500 mb-3" />
                <p className="font-medium mb-1">{t('onboarding.featureCloud')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('onboarding.featureCloudDesc')}
                </p>
              </div>
            </div>

            <Button 
              onClick={() => setStep('storage-choice')} 
              className="w-full"
            >
              {t('onboarding.getStarted')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'storage-choice') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <Stepper currentStep={getStepNumber()} t={t} />
            <CardTitle className="text-2xl">{t('onboarding.storageChoiceTitle')}</CardTitle>
            <CardDescription>
              {t('onboarding.storageChoiceDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleStorageChoice('local')}
                disabled={isLoading}
                className="p-6 border-2 rounded-lg hover:border-primary hover:bg-accent/50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed h-full"
              >
                <div className="flex flex-col h-full">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                    <HardDrive className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-xl mb-2">{t('onboarding.localStorageTitle')}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t('onboarding.localStorageDesc')}
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2 mt-auto">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {t('onboarding.localNoAccount')}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {t('onboarding.localPrivate')}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      {t('onboarding.localOffline')}
                    </li>
                  </ul>
                </div>
              </button>

              {/* Masquer l'option cloud si désactivée */}
              {ENABLE_CLOUD_FEATURES && (
                <button
                  onClick={() => handleStorageChoice('cloud')}
                  disabled={isLoading}
                  className="p-6 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-500/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed h-full"
                >
                  <div className="flex flex-col h-full">
                    <div className="p-3 rounded-lg bg-blue-500/10 w-fit mb-4">
                      <Cloud className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="font-semibold text-xl mb-2">{t('onboarding.cloudStorageTitle')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {t('onboarding.cloudStorageDesc')}
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-2 mt-auto">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        {t('onboarding.cloudRealtime')}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        {t('onboarding.cloudAllDevices')}
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        {t('onboarding.cloudBackup')}
                      </li>
                    </ul>
                  </div>
                </button>
              )}
            </div>

            <Button
              variant="ghost"
              onClick={() => setStep('welcome')}
              className="w-full"
              disabled={isLoading}
            >
              {t('onboarding.back')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === 'cloud-setup') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <Stepper currentStep={getStepNumber()} t={t} />
            <CardTitle className="text-2xl">
              {cloudMode === 'signup' ? t('onboarding.cloudSetupTitle') : t('onboarding.cloudSigninTitle')}
            </CardTitle>
            <CardDescription>
              {cloudMode === 'signup' 
                ? t('onboarding.cloudSetupDesc')
                : t('onboarding.cloudSigninDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCloudAuth} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('onboarding.emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('onboarding.emailPlaceholder')}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t('onboarding.passwordLabel')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('onboarding.passwordPlaceholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>

              {cloudMode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('onboarding.confirmPasswordLabel')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder={t('onboarding.confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    required
                    minLength={6}
                  />
                </div>
              )}

              {cloudMode === 'signup' && (
                <div className="bg-muted/50 p-4 rounded-lg text-sm">
                  <p className="text-muted-foreground">
                    {t('onboarding.termsInfo')}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {cloudMode === 'signup' ? t('onboarding.creating') : t('onboarding.signingIn')}
                    </>
                  ) : (
                    cloudMode === 'signup' ? t('onboarding.createAccount') : t('onboarding.signIn')
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">{t('onboarding.or')}</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCloudMode(cloudMode === 'signup' ? 'signin' : 'signup')
                    setError(null)
                  }}
                  disabled={isLoading}
                  className="w-full"
                >
                  {cloudMode === 'signup' ? t('onboarding.hasAccount') : t('onboarding.createNewAccount')}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setStep('storage-choice')
                    setError(null)
                    setEmail('')
                    setPassword('')
                    setConfirmPassword('')
                  }}
                  disabled={isLoading}
                  className="w-full"
                >
                  {t('onboarding.back')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
