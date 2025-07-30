import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { AlertData } from './Dashboard';

interface CrisisProcessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  incident: AlertData | null;
}

export const CrisisProcessDialog = ({ open, onOpenChange, incident }: CrisisProcessDialogProps) => {
  const [operatorName, setOperatorName] = useState('');
  const [warRoomLink, setWarRoomLink] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!operatorName.trim() || !warRoomLink.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha seu nome e o link da War Room",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Chamar Edge Function do Supabase para processar a crise
      const response = await fetch('/functions/v1/crisis-process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          operatorName,
          warRoomLink,
          incidentTitle: incident?.titulo,
          incidentSeverity: incident?.severidade,
          incidentTeam: incident?.equipe,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao processar solicitação');
      }

      toast({
        title: "Processo de crise iniciado com sucesso!",
        description: `Planilha criada e compartilhada. Notificação enviada no Google Chat.`,
      });

      // Reset form and close dialog
      setOperatorName('');
      setWarRoomLink('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error starting crisis process:', error);
      toast({
        title: "Erro ao iniciar processo de crise",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-panel-bg border-border">
        <DialogHeader>
          <DialogTitle className="text-primary">Iniciar Processo de Crise</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="incident-title">Incidente</Label>
            <Input
              id="incident-title"
              value={incident?.titulo || ''}
              disabled
              className="bg-muted text-muted-foreground"
            />
          </div>
          
          <div>
            <Label htmlFor="operator-name">Seu Nome *</Label>
            <Input
              id="operator-name"
              value={operatorName}
              onChange={(e) => setOperatorName(e.target.value)}
              placeholder="Digite seu nome"
              className="bg-background border-border"
            />
          </div>
          
          <div>
            <Label htmlFor="war-room-link">Link da War Room *</Label>
            <Input
              id="war-room-link"
              value={warRoomLink}
              onChange={(e) => setWarRoomLink(e.target.value)}
              placeholder="Cole o link da War Room aqui"
              className="bg-background border-border"
            />
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border hover:bg-hover-bg"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? 'Enviando...' : 'Iniciar Processo de Crise'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};