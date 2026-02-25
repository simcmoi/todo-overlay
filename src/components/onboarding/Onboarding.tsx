import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, Check, Cloud, HardDrive, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTodoStore } from '@/store/use-todo-store'
import type { StorageMode } from '@/lib/storage/types'

type OnboardingStep = 'welcome' | 'storage-choice' | 'cloud-setup'

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>('welcome')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { setStorageMode, signUp } = useTodoStore()

  const handleStorageChoice = (mode: StorageMode) => {
    if (mode === 'local') {
      // Pour le mode local, on termine directement l'onboarding
      handleLocalSetup()
    } else {
      // Pour le cloud, on passe à l'étape de création de compte
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

  const handleCloudSetup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Passer en mode cloud d'abord
      await setStorageMode('cloud')
      
      // Créer le compte
      await signUp(email, password)
      
      // Succès !
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du compte')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'welcome') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="w-full max-w-lg mx-4">
          <CardHeader>
            <CardTitle className="text-2xl">Bienvenue sur Todo Overlay</CardTitle>
            <CardDescription className="text-base">
              Votre gestionnaire de tâches minimaliste et puissant
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Interface minimaliste</p>
                  <p className="text-sm text-muted-foreground">
                    Concentrez-vous sur vos tâches sans distraction
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Raccourci global</p>
                  <p className="text-sm text-muted-foreground">
                    Accédez à vos tâches depuis n'importe où avec Shift+Espace
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Synchronisation cloud (optionnelle)</p>
                  <p className="text-sm text-muted-foreground">
                    Synchronisez vos tâches sur tous vos appareils
                  </p>
                </div>
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="w-full max-w-lg mx-4">
          <CardHeader>
            <CardTitle>Choisissez votre mode de stockage</CardTitle>
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

            <button
              onClick={() => handleStorageChoice('local')}
              disabled={isLoading}
              className="w-full p-6 border-2 rounded-lg hover:border-primary hover:bg-accent/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10">
                  <HardDrive className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Stockage Local</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Vos données restent uniquement sur cet appareil
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Aucun compte requis</li>
                    <li>• Données 100% privées</li>
                    <li>• Fonctionne hors ligne</li>
                    <li>• Pas de synchronisation entre appareils</li>
                  </ul>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleStorageChoice('cloud')}
              disabled={isLoading}
              className="w-full p-6 border-2 rounded-lg hover:border-primary hover:bg-accent/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Cloud className="h-6 w-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Stockage Cloud</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Synchronisez vos tâches sur tous vos appareils
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Compte gratuit requis</li>
                    <li>• Synchronisation en temps réel</li>
                    <li>• Accès depuis tous vos appareils</li>
                    <li>• Sauvegarde automatique</li>
                  </ul>
                </div>
              </div>
            </button>

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Card className="w-full max-w-lg mx-4">
          <CardHeader>
            <CardTitle>Créer votre compte cloud</CardTitle>
            <CardDescription>
              Créez un compte gratuit pour synchroniser vos tâches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCloudSetup} className="space-y-4">
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

              <div className="bg-muted/50 p-4 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  En créant un compte, vous acceptez que vos données soient stockées
                  de manière sécurisée sur nos serveurs Supabase.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('storage-choice')}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Retour
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Créer mon compte'
                  )}
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
