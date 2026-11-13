import { forwardRef, useCallback, useEffect, useRef } from 'react';
import type {
  ButtonHTMLAttributes, DetailsHTMLAttributes, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent,
  ReactNode, SyntheticEvent,
} from 'react';
import { Expand, Shrink } from 'lucide-react';

import type { SvgComponent } from '../types';

/**
 * Renders one of the project's own SVG assets (imported with `?react`).
 * The wrapper span carries the sizing/colour class that the CSS targets.
 */
export function SvgIcon({ icon: Icon, className }: { icon: SvgComponent; className?: string }) {
  return <span className={className} aria-hidden="true"><Icon /></span>;
}

interface AppButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  size?: 'compact' | 'default';
  variant?: 'filled' | 'outline';
  formAction?: 'none' | 'submit' | 'reset';
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

/** The house button: services-ui's BaseButton markup with Stormbox's compact sizing. */
export function AppButton({
  size = 'compact', variant = 'filled', formAction = 'none', iconLeft, iconRight, className, children, ...rest
}: AppButtonProps) {
  const classes = ['base', 'primary', variant, 'app-button', size === 'compact' ? 'app-button--compact' : '', className ?? '']
    .filter(Boolean).join(' ');
  return (
    <button {...rest} className={classes} type={formAction === 'none' ? 'button' : formAction} data-testid="button">
      {iconLeft ? <span className="icon">{iconLeft}</span> : null}
      <span className="text">{children}</span>
      {iconRight ? <span className="icon">{iconRight}</span> : null}
    </button>
  );
}

interface AppIconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  danger?: boolean;
}

export const AppIconButton = forwardRef<HTMLButtonElement, AppIconButtonProps>(
  ({ danger = false, className, children, ...rest }, ref) => (
    <button
      {...rest}
      ref={ref}
      type="button"
      className={['app-icon-button', danger ? 'app-icon-button--danger' : '', className ?? ''].filter(Boolean).join(' ')}
    >
      {children}
    </button>
  ),
);

interface AppToggleButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  active?: boolean;
}

export function AppToggleButton({ active = false, className, children, ...rest }: AppToggleButtonProps) {
  return (
    <button
      {...rest}
      type="button"
      className={['app-toggle-button', active ? 'is-active' : '', className ?? ''].filter(Boolean).join(' ')}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

export function MaximizeButton({ maximized, surface, onToggle, className }: {
  maximized: boolean;
  surface: string;
  onToggle: () => void;
  className?: string;
}) {
  const label = `${maximized ? 'Restore' : 'Maximize'} ${surface}`;
  return (
    <AppIconButton
      className={className}
      aria-label={label}
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onToggle}
    >
      {maximized
        ? <Shrink size={18} strokeWidth={1.65} aria-hidden="true" />
        : <Expand size={18} strokeWidth={1.65} aria-hidden="true" />}
    </AppIconButton>
  );
}

export function closeContainingDropdown(source: Event | SyntheticEvent | Element | null | undefined): void {
  const element = source instanceof Element ? source : (source as Event | SyntheticEvent | null)?.currentTarget;
  if (!(element instanceof Element)) return;
  const details = element.closest('details');
  if (details instanceof HTMLDetailsElement) details.open = false;
}

interface AppDropdownProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, 'onToggle'> {
  group?: string;
  disabled?: boolean;
  onToggle?: (event: SyntheticEvent<HTMLDetailsElement>) => void;
}

/**
 * A <details> dropdown that closes its peers when it opens, closes on an
 * outside pointer down or Escape, and can be disabled.
 */
export function AppDropdown({ group = 'app', disabled = false, className, onToggle, children, ...rest }: AppDropdownProps) {
  const detailsRef = useRef<HTMLDetailsElement | null>(null);

  const onOutsidePointerDown = useCallback((event: Event) => {
    const el = detailsRef.current;
    if (!el?.open) return;
    if (event.target instanceof Node && el.contains(event.target)) return;
    el.open = false;
  }, []);

  const onEscape = useCallback((event: KeyboardEvent) => {
    const el = detailsRef.current;
    if (!el?.open || event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    el.open = false;
    if (el.contains(document.activeElement)) el.querySelector('summary')?.focus();
  }, []);

  const unlisten = useCallback(() => {
    document.removeEventListener('pointerdown', onOutsidePointerDown, true);
    document.removeEventListener('keydown', onEscape, true);
  }, [onOutsidePointerDown, onEscape]);

  useEffect(() => unlisten, [unlisten]);

  function handleToggle(event: SyntheticEvent<HTMLDetailsElement>) {
    const el = detailsRef.current;
    if (el) {
      if (!el.open) {
        unlisten();
      } else {
        document.addEventListener('pointerdown', onOutsidePointerDown, true);
        document.addEventListener('keydown', onEscape, true);
        document.querySelectorAll<HTMLDetailsElement>(`details[data-dropdown-group="${group}"]`).forEach((other) => {
          if (other !== el && other.open) other.open = false;
        });
      }
    }
    onToggle?.(event);
  }

  function onClickCapture(event: ReactMouseEvent) {
    if (!disabled) return;
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <details
      {...rest}
      ref={detailsRef}
      className={['app-dropdown', disabled ? 'app-dropdown--disabled' : '', className ?? ''].filter(Boolean).join(' ')}
      data-dropdown-group={group}
      onToggle={handleToggle}
      onClickCapture={onClickCapture}
    >
      {children}
    </details>
  );
}

/** Arrow-key movement between the focusable items of a menu panel. */
export function menuKeyDown(menu: HTMLElement | null, itemSelector: string, event: ReactKeyboardEvent): void {
  if (event.key === 'Tab') {
    const details = menu?.closest('details');
    if (details instanceof HTMLDetailsElement && details.open) {
      details.open = false;
      details.querySelector<HTMLElement>('summary')?.focus();
    }
    return;
  }
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  const list = Array.from(menu?.querySelectorAll<HTMLElement>(itemSelector) ?? []);
  if (list.length === 0) return;
  event.preventDefault();
  const current = list.indexOf(document.activeElement as HTMLElement);
  let next: number;
  switch (event.key) {
    case 'ArrowDown': next = current < 0 ? 0 : Math.min(list.length - 1, current + 1); break;
    case 'ArrowUp': next = current < 0 ? list.length - 1 : Math.max(0, current - 1); break;
    case 'Home': next = 0; break;
    default: next = list.length - 1;
  }
  list[next]?.focus();
}
