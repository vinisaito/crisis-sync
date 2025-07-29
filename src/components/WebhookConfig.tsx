import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Webhook } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface WebhookConfigProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface WebhookData {
  [team: string]: string;
}

export const WebhookConfig = ({ open, onOpenChange }: WebhookConfigProps) => {
  const [webhooks, setWebhooks] = useState<WebhookData>({});
  const [crisisWebhook, setCrisisWebhook] = useState('');
  const [newTeam, setNewTeam] = useState('');
  const [newWebhook, setNewWebhook] = useState('');

  // Load webhooks from localStorage on component mount
  useEffect(() => {
    const savedWebhooks = localStorage.getItem('webhooks');
    if (savedWebhooks) {
      try {
        setWebhooks(JSON.parse(savedWebhooks));
      } catch (error) {
        console.error('Error loading webhooks:', error);
      }
    }

    const savedCrisisWebhook = localStorage.getItem('crisisWebhook');
    if (savedCrisisWebhook) {
      setCrisisWebhook(savedCrisisWebhook);
    }
  }, []);

  // Save webhooks to localStorage
  const saveWebhooks = (newWebhooks: WebhookData) => {
    localStorage.setItem('webhooks', JSON.stringify(newWebhooks));
    setWebhooks(newWebhooks);
  };

  // Save crisis webhook to localStorage
  const saveCrisisWebhook = (webhook: string) => {
    localStorage.setItem('crisisWebhook', webhook);
    setCrisisWebhook(webhook);
  };

  const addWebhook = () => {
    if (!newTeam.trim() || !newWebhook.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o nome da equipe e a URL do webhook",
        variant: "destructive",
      });
      return;
    }

    if (!newWebhook.startsWith('https://chat.googleapis.com/')) {
      toast({
        title: "URL inválida",
        description: "A URL deve ser um webhook válido do Google Chat",
        variant: "destructive",
      });
      return;
    }

    const updatedWebhooks = {
      ...webhooks,
      [newTeam.trim()]: newWebhook.trim()
    };

    saveWebhooks(updatedWebhooks);
    setNewTeam('');
    setNewWebhook('');

    toast({
      title: "Webhook adicionado",
      description: `Webhook configurado para a equipe ${newTeam}`,
    });
  };

  const removeWebhook = (team: string) => {
    const updatedWebhooks = { ...webhooks };
    delete updatedWebhooks[team];
    saveWebhooks(updatedWebhooks);

    toast({
      title: "Webhook removido",
      description: `Webhook da equipe ${team} foi removido`,
    });
  };

  const updateCrisisWebhook = () => {
    if (!crisisWebhook.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Preencha a URL do webhook de crise",
        variant: "destructive",
      });
      return;
    }

    if (!crisisWebhook.startsWith('https://chat.googleapis.com/')) {
      toast({
        title: "URL inválida",
        description: "A URL deve ser um webhook válido do Google Chat",
        variant: "destructive",
      });
      return;
    }

    saveCrisisWebhook(crisisWebhook);

    toast({
      title: "Webhook de crise salvo",
      description: "Webhook para processos de crise foi configurado",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-panel-bg border-border max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Configuração de Webhooks
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Crisis Webhook */}
          <Card className="bg-background/30 border-border">
            <CardHeader>
              <CardTitle className="text-sm text-destructive">Webhook para Processos de Crise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="crisis-webhook">URL do Webhook (Google Chat)</Label>
                <Input
                  id="crisis-webhook"
                  value={crisisWebhook}
                  onChange={(e) => setCrisisWebhook(e.target.value)}
                  placeholder="https://chat.googleapis.com/v1/spaces/..."
                  className="bg-background border-border"
                />
              </div>
              <Button onClick={updateCrisisWebhook} className="w-full">
                Salvar Webhook de Crise
              </Button>
            </CardContent>
          </Card>

          {/* Team Webhooks */}
          <Card className="bg-background/30 border-border">
            <CardHeader>
              <CardTitle className="text-sm text-primary">Webhooks por Equipe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add new webhook form */}
              <div className="border border-border rounded-lg p-4 bg-background/50">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="team-name">Nome da Equipe</Label>
                      <Input
                        id="team-name"
                        value={newTeam}
                        onChange={(e) => setNewTeam(e.target.value)}
                        placeholder="Ex: NOC, SOC, Infraestrutura"
                        className="bg-background border-border"
                      />
                    </div>
                    <div>
                      <Label htmlFor="webhook-url">URL do Webhook</Label>
                      <Input
                        id="webhook-url"
                        value={newWebhook}
                        onChange={(e) => setNewWebhook(e.target.value)}
                        placeholder="https://chat.googleapis.com/v1/spaces/..."
                        className="bg-background border-border"
                      />
                    </div>
                  </div>
                  <Button onClick={addWebhook} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Webhook
                  </Button>
                </div>
              </div>

              {/* Existing webhooks list */}
              <div className="space-y-2">
                {Object.entries(webhooks).length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    Nenhum webhook configurado
                  </div>
                ) : (
                  Object.entries(webhooks).map(([team, webhook]) => (
                    <div
                      key={team}
                      className="flex items-center justify-between p-3 border border-border rounded-lg bg-background/30"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">{team}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {webhook}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeWebhook(team)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card className="bg-background/30 border-border">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Como obter um Webhook do Google Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Acesse o Google Chat e entre no espaço desejado</li>
                <li>Clique no nome do espaço → "Gerenciar webhooks"</li>
                <li>Clique em "Adicionar webhook"</li>
                <li>Defina um nome e avatar (opcional)</li>
                <li>Copie a URL gerada e cole aqui</li>
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-border hover:bg-hover-bg"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
