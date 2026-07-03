import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { navItemsByRole, roleLabels } from '@/components/layout/nav-items';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { PrinterAutoDialog } from '@/components/sales/printer-auto-dialog';
import { userIdentifier } from '@/lib/format';

function initialsFrom(value: string): string {
  return value.slice(0, 2).toUpperCase();
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!user) return null;

  const items = navItemsByRole[user.role];

  return (
    <div className="min-h-svh bg-muted/40">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:block">
        <SidebarNav items={items} />
      </aside>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-64 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground [&>button]:text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
          <SidebarNav items={items} onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu className="size-5" />
          </Button>

          <Badge variant="secondary" className="hidden lg:inline-flex">
            {roleLabels[user.role]}
          </Badge>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="ml-auto flex items-center gap-2 px-2">
                <Avatar className="size-8 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {initialsFrom(userIdentifier(user))}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:inline">
                  {userIdentifier(user)}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userIdentifier(user)}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {roleLabels[user.role]}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} variant="destructive">
                <LogOut className="size-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </main>
      </div>

      <PrinterAutoDialog />
    </div>
  );
}
