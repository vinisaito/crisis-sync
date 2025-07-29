import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, MessageSquare, Clock, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShiftNote {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  priority: 'normal' | 'important';
}

export const ShiftNotes = () => {
  const [notes, setNotes] = useState<ShiftNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isImportant, setIsImportant] = useState(false);

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('shiftNotes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (error) {
        console.error('Error loading shift notes:', error);
      }
    }

    // Load saved author name
    const savedAuthor = localStorage.getItem('shiftNotesAuthor');
    if (savedAuthor) {
      setAuthorName(savedAuthor);
    }
  }, []);

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('shiftNotes', JSON.stringify(notes));
  }, [notes]);

  // Save author name to localStorage
  useEffect(() => {
    if (authorName) {
      localStorage.setItem('shiftNotesAuthor', authorName);
    }
  }, [authorName]);

  const addNote = () => {
    if (!newNote.trim() || !authorName.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha seu nome e a mensagem do recado",
        variant: "destructive",
      });
      return;
    }

    const note: ShiftNote = {
      id: `note-${Date.now()}`,
      author: authorName.trim(),
      message: newNote.trim(),
      timestamp: new Date().toISOString(),
      priority: isImportant ? 'important' : 'normal'
    };

    setNotes(prev => [note, ...prev]);
    setNewNote('');
    setIsImportant(false);

    toast({
      title: "Recado adicionado",
      description: "O recado foi adicionado com sucesso",
    });
  };

  const removeNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    toast({
      title: "Recado removido",
      description: "O recado foi removido com sucesso",
    });
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="bg-panel-bg border-border">
      <CardHeader>
        <CardTitle className="text-primary flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Recados do Turno
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Add new note form */}
          <div className="border border-border rounded-lg p-4 bg-background/30">
            <div className="space-y-4">
              <div>
                <Label htmlFor="author-name">Seu Nome</Label>
                <Input
                  id="author-name"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Digite seu nome"
                  className="bg-background border-border"
                />
              </div>
              
              <div>
                <Label htmlFor="note-message">Recado</Label>
                <Textarea
                  id="note-message"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Digite o recado para o próximo turno..."
                  className="bg-background border-border min-h-[100px]"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="important"
                    checked={isImportant}
                    onChange={(e) => setIsImportant(e.target.checked)}
                    className="rounded border-border"
                  />
                  <Label htmlFor="important" className="text-sm text-warning">
                    Marcar como importante
                  </Label>
                </div>
                
                <Button
                  onClick={addNote}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Recado
                </Button>
              </div>
            </div>
          </div>

          {/* Notes list */}
          <div className="space-y-3">
            {notes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum recado no turno atual
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className={`border rounded-lg p-4 bg-background/50 ${
                    note.priority === 'important' 
                      ? 'border-warning/50 bg-warning/5' 
                      : 'border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <User className="h-3 w-3" />
                          <span className="font-medium">{note.author}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimestamp(note.timestamp)}</span>
                        </div>
                        {note.priority === 'important' && (
                          <span className="text-xs px-2 py-1 bg-warning text-black rounded font-medium">
                            IMPORTANTE
                          </span>
                        )}
                      </div>
                      <p className="text-foreground whitespace-pre-wrap">{note.message}</p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNote(note.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};