import Image from "next/image";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { logoSrc, nav, site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-inset">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <a
            href={site.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3"
            aria-label={`${site.name} no Instagram`}
          >
            <Image
              src={logoSrc}
              alt=""
              width={44}
              height={44}
              unoptimized
              className="size-11 rounded-full"
            />
            <div>
              <p className="font-display text-lg font-semibold leading-tight">
                Excursão <span className="text-accent">Kairós</span>
              </p>
              <p className="text-sm text-muted">{site.tagline}</p>
            </div>
          </a>
          <p className="mt-6 max-w-sm text-base leading-relaxed text-muted">
            Responsável: <span className="text-foreground">{site.owner}</span>.
            Excursões em grupo organizadas com cuidado, do primeiro contato ao
            retorno para casa.
          </p>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Navegação
          </p>
          <ul className="space-y-2 text-base">
            {nav.map((item) => (
              <li key={item.href}>
                <a href={item.href} className="text-muted transition-colors hover:text-foreground">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            Fale com a gente
          </p>
          <ul className="space-y-3 text-base">
            <li>
              <a
                href={site.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 font-medium text-accent transition-all hover:bg-kairos-yellow hover:text-kairos-black hover:shadow-[0_0_30px_-8px_var(--kairos-yellow)]"
              >
                <InstagramIcon className="size-4" />
                {site.instagramHandle}
              </a>
            </li>
            <li>
              <a
                href={site.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-muted transition-colors hover:text-foreground"
              >
                <WhatsAppIcon className="size-4" />
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {site.name}. Todos os direitos reservados.
          </p>
          <p>Siga a Kairós no Instagram para ver as próximas saídas.</p>
        </div>
      </div>
    </footer>
  );
}
