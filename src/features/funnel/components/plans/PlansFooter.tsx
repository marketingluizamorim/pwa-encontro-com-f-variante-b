import { Link } from 'react-router-dom';

export function PlansFooter() {
  return (
    <div className="mt-6 flex flex-wrap justify-center items-center gap-4 text-primary-foreground/50 text-xs">
      <Link to="/termos-de-uso" className="hover:text-primary-foreground/80 transition-colors">
        Termos de Uso
      </Link>
      <span>•</span>
      <Link to="/politica-de-reembolso" className="hover:text-primary-foreground/80 transition-colors">
        Política de Reembolso
      </Link>
    </div>
  );
}
