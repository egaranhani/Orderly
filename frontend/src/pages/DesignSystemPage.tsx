import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loading } from '@/components/ui/loading';
import { DragDropExample } from '@/components/ui/drag-drop-example';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const DesignSystemPage: React.FC = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dragItems, setDragItems] = useState([
    'Item 1',
    'Item 2',
    'Item 3',
    'Item 4',
  ]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Design System</h1>
        <p className="text-muted-foreground">
          Componentes do sistema para definição e edição pelo designer
        </p>
      </div>

      {/* Buttons Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Buttons</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button disabled>Disabled</Button>
            <Button variant="default" disabled>
              Disabled Default
            </Button>
          </div>
        </div>
      </section>

      {/* Inputs Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Inputs</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-sm font-medium mb-2 block">Text Input</label>
            <Input type="text" placeholder="Digite algo..." />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Number Input</label>
            <Input type="number" placeholder="123" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Date Input</label>
            <Input type="date" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Email Input</label>
            <Input type="email" placeholder="email@exemplo.com" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Password Input</label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Disabled Input</label>
            <Input type="text" placeholder="Desabilitado" disabled />
          </div>
        </div>
      </section>

      {/* Select Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Select</h2>
        <div className="space-y-4 max-w-md">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="option1">Opção 1</SelectItem>
              <SelectItem value="option2">Opção 2</SelectItem>
              <SelectItem value="option3">Opção 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Cards Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Card com Header</CardTitle>
              <CardDescription>Descrição do card</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Conteúdo do card aqui.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Ação</Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Card Simples</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card sem footer e sem descrição.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Dialog/Modal Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Dialog / Modal</h2>
        <div className="flex gap-4">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Abrir Dialog</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Exemplo de Dialog</DialogTitle>
                <DialogDescription>
                  Este é um exemplo de dialog/modal. Pode ser usado para
                  confirmações, formulários, etc.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p>Conteúdo do dialog aqui.</p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setDialogOpen(false)}>Confirmar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Loading Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Loading / Spinner</h2>
        <div className="flex gap-8 items-center">
          <div className="text-center">
            <Loading size="sm" className="mb-2" />
            <p className="text-sm text-muted-foreground">Small</p>
          </div>
          <div className="text-center">
            <Loading size="md" className="mb-2" />
            <p className="text-sm text-muted-foreground">Medium</p>
          </div>
          <div className="text-center">
            <Loading size="lg" className="mb-2" />
            <p className="text-sm text-muted-foreground">Large</p>
          </div>
        </div>
      </section>

      {/* Drag and Drop Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Drag and Drop</h2>
        <div className="max-w-md">
          <p className="text-sm text-muted-foreground mb-4">
            Arraste os itens para reordená-los
          </p>
          <DragDropExample
            items={dragItems}
            onReorder={setDragItems}
          />
        </div>
      </section>

      {/* Dropdown Menu Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Dropdown Menu</h2>
        <div className="flex gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Abrir Menu</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuItem>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>
    </div>
  );
};
