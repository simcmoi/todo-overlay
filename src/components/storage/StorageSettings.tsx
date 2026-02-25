import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useTodoStore } from '@/store/use-todo-store'
import { AuthForm } from '@/components/auth/AuthForm'
import { SyncStatusIndicator } from '@/components/storage/SyncStatusIndicator'
import { Cloud, HardDrive, LogOut, AlertTriangle } from 'lucide-react'

export function StorageSettings() {
  const {
    storageMode,
    setStorageMode,
    isAuthenticated,
    getCurrentUserEmail,
    signOut,
  } = useTodoStore()

  const [isChangingMode, setIsChangingMode] = useState(false)
  const [showMigrationWarning, setShowMigrationWarning] = useState(false)

  const isCloudMode = storageMode === 'cloud'
  const userEmail = getCurrentUserEmail()

  const handleStorageModeToggle = async (checked: boolean) => {
    const targetMode = checked ? 'cloud' : 'local'

    // Si on bascule vers le cloud et qu'on n'est pas authentifié, afficher le formulaire
    if (targetMode === 'cloud' && !isAuthenticated()) {
      setIsChangingMode(true)
      await setStorageMode(targetMode)
      setIsChangingMode(false)
      return
    }

    // Afficher un avertissement si on change de mode
    setShowMigrationWarning(true)
  }

  const confirmModeChange = async () => {
    setIsChangingMode(true)
    try {
      const targetMode = isCloudMode ? 'local' : 'cloud'
      await setStorageMode(targetMode)
      setShowMigrationWarning(false)
    } finally {
      setIsChangingMode(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      await setStorageMode('local')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mode de stockage</CardTitle>
              <CardDescription>
                Choisissez entre stockage local ou synchronisation cloud
              </CardDescription>
            </div>
            <SyncStatusIndicator />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isCloudMode ? (
                <Cloud className="h-5 w-5 text-primary" />
              ) : (
                <HardDrive className="h-5 w-5 text-muted-foreground" />
              )}
              <div className="space-y-0.5">
                <Label htmlFor="storage-mode" className="text-base">
                  Synchronisation cloud
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isCloudMode
                    ? 'Vos données sont synchronisées dans le cloud'
                    : 'Vos données sont stockées localement uniquement'}
                </p>
              </div>
            </div>
            <Switch
              id="storage-mode"
              checked={isCloudMode}
              onCheckedChange={handleStorageModeToggle}
              disabled={isChangingMode}
            />
          </div>

          {showMigrationWarning && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="space-y-3">
                <p>
                  Attention : Le changement de mode de stockage nécessite une migration manuelle de vos
                  données.
                </p>
                <p className="text-sm">
                  Les données du mode actuel ne seront pas automatiquement transférées vers le nouveau
                  mode.
                </p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" onClick={confirmModeChange} disabled={isChangingMode}>
                    Confirmer le changement
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowMigrationWarning(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {isCloudMode && isAuthenticated() && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Compte connecté</p>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isCloudMode && !isAuthenticated() && (
        <div className="flex justify-center">
          <AuthForm />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Mode local</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Données stockées uniquement sur cet appareil</li>
              <li>Pas de synchronisation entre appareils</li>
              <li>Privacité maximale</li>
              <li>Fonctionne sans connexion internet</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Mode cloud</h4>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Synchronisation automatique entre tous vos appareils</li>
              <li>Sauvegarde sécurisée dans le cloud (Supabase)</li>
              <li>Mises à jour en temps réel</li>
              <li>Nécessite une connexion internet</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
