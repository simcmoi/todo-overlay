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

type OnboardingStep = 'welcome' | 'storage-choice' | 'cloud-setup'
type CloudMode = 'signup' | 'signin'

interface OnboardingProps {
  onComplete: () => void
}

// Composant Stepper
function Stepper({ currentStep }: { currentStep: number }) {
  const steps = [
    { number: 1, label: 'Bienvenue' },
    { number: 2, label: 'Stockage' },
    { number: 3, label: 'Configuration' }
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
      setStep('cloud-setup')
    }
  }

  const handleLocalSetup = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await setStorageMode('local')
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloudAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validation email
    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide')
      return
    }

    // Validation password
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    // Validation confirmPassword (uniquement pour signup)
    if (cloudMode === 'signup' && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
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
      setError(err instanceof Error ? err.message : `Erreur lors de la ${cloudMode === 'signup' ? 'création du compte' : 'connexion'}`)
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
            <Stepper currentStep={getStepNumber()} />
            <CardTitle className="text-3xl">Bienvenue sur Todo Overlay</CardTitle>
            <CardDescription className="text-base">
              Votre gestionnaire de tâches minimaliste et puissant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-accent/50">
                <Check className="h-8 w-8 text-green-500 mb-3" />
                <p className="font-medium mb-1">Interface minimaliste</p>
                <p className="text-sm text-muted-foreground">
                  Concentrez-vous sur vos tâches sans distraction
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-accent/50">
                <Check className="h-8 w-8 text-green-500 mb-3" />
                <p className="font-medium mb-1">Raccourci global</p>
                <p className="text-sm text-muted-foreground">
                  Accédez à vos tâches depuis n'importe où
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-accent/50">
                <Check className="h-8 w-8 text-green-500 mb-3" />
                <p className="font-medium mb-1">Synchronisation cloud</p>
                <p className="text-sm text-muted-foreground">
                  Synchronisez vos tâches sur tous vos appareils
                </p>
              </div>
            </div>

            <Button 
              onClick={() => setStep('storage-choice')} 
              className="w-full"
            >
              Commencer
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
            <Stepper currentStep={getStepNumber()} />
            <CardTitle className="text-2xl">Choisissez votre mode de stockage</CardTitle>
            <CardDescription>
              Vous pourrez changer cette option plus tard dans les paramètres
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
                  <h3 className="font-semibold text-xl mb-2">Stockage Local</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Vos données restent uniquement sur cet appareil
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2 mt-auto">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Aucun compte requis
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Données 100% privées
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      Fonctionne hors ligne
                    </li>
                  </ul>
                </div>
              </button>

              <button
                onClick={() => handleStorageChoice('cloud')}
                disabled={isLoading}
                className="p-6 border-2 rounded-lg hover:border-blue-500 hover:bg-blue-500/5 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed h-full"
              >
                <div className="flex flex-col h-full">
                  <div className="p-3 rounded-lg bg-blue-500/10 w-fit mb-4">
                    <Cloud className="h-8 w-8 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-xl mb-2">Stockage Cloud</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Synchronisez vos tâches sur tous vos appareils
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-2 mt-auto">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      Synchronisation en temps réel
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      Accès depuis tous vos appareils
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      Sauvegarde automatique
                    </li>
                  </ul>
                </div>
              </button>
            </div>

            <Button
              variant="ghost"
              onClick={() => setStep('welcome')}
              className="w-full"
              disabled={isLoading}
            >
              Retour
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
            <Stepper currentStep={getStepNumber()} />
            <CardTitle className="text-2xl">
              {cloudMode === 'signup' ? 'Créer votre compte cloud' : 'Connexion à votre compte'}
            </CardTitle>
            <CardDescription>
              {cloudMode === 'signup' 
                ? 'Créez un compte gratuit pour synchroniser vos tâches' 
                : 'Connectez-vous pour accéder à vos tâches synchronisées'}
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
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 caractères"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={6}
                />
              </div>

              {cloudMode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Retapez votre mot de passe"
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
                    En créant un compte, vous acceptez que vos données soient stockées
                    de manière sécurisée sur nos serveurs Supabase.
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
                      {cloudMode === 'signup' ? 'Création...' : 'Connexion...'}
                    </>
                  ) : (
                    cloudMode === 'signup' ? 'Créer mon compte' : 'Se connecter'
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">ou</span>
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
                  {cloudMode === 'signup' ? 'J\'ai déjà un compte' : 'Créer un nouveau compte'}
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
                  Retour
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
