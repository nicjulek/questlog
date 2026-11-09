import { EmptyState } from '../components/ui/States'
import { ButtonLink } from '../components/ui/Button'
import { usePageTitle } from '../lib/usePageTitle'

export function NotFoundPage() {
  usePageTitle('Página não encontrada')
  return (
    <EmptyState title="Este canto do mapa está vazio" action={<ButtonLink to="/">Ir para a biblioteca</ButtonLink>}>
      O endereço não existe ou foi removido.
    </EmptyState>
  )
}
