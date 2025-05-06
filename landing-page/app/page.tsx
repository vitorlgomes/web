"use client";

import Image from "next/image";
import styles from "./styles.module.css";
import React from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [planType, setPlanType] = React.useState<"mensal" | "anual">("mensal");

  const prices = {
    mensal: { basic: "R$250", premium: "R$500" },
    anual: { basic: "R$199", premium: "R$399" },
  };

  return (
    <main className={styles.main}>
      {/* Header */}
      <header className={styles.headerCustom}>
        <div className={styles.headerLeftCustom}>
          <Image
            src="/lirio.png"
            alt="Lirio Logo"
            width={104}
            height={32}
            className={styles.logoIcon}
          />
          <nav
            className={`${styles.navCustom} ${menuOpen ? styles.navOpen : ""}`}
          >
            <a href="#solucoes">Soluções</a>
            <a href="#vantagens">Vantagens</a>
            <a href="#planos">Planos</a>
            <a href="#contato">Contato</a>
          </nav>
          <button
            className={styles.menuToggle}
            aria-label="Abrir menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={styles.menuIcon} />
          </button>
        </div>
        <button className={styles.ctaHeaderCustom}>
          Transforme seu negócio
        </button>
      </header>

      {/* Hero Section with video background */}
      <section className={styles.heroVideoSection}>
        <video
          className={styles.heroVideo}
          src={"/video.mp4"}
          autoPlay
          loop
          muted
          playsInline
        />
        <a href="#solucoes" className={styles.scrollDown}>
          Descubra mais <br />
          <Image
            src="/chevron-down.svg"
            width={24}
            height={24}
            alt="Scroll Down"
          />
        </a>
      </section>

      {/* Soluções */}
      <section id="solucoes" className={styles.solucoesSection}>
        <div className={styles.solucoesContent}>
          <div className={styles.solucoesLeft}>
            <h3 className={styles.solucoesLabel}>Soluções</h3>
            <h2 className={styles.solucoesTitle}>
              Resolva os desafios do seu restaurante agora
            </h2>
            <p className={styles.solucoesDesc}>
              Elimine as filas e melhore a experiência dos clientes com pedidos
              via QR Code.
              <br />
              Simplifique pagamentos e tenha controle total do seu negócio.
            </p>
            <div className={styles.solucoesGrid}>
              <div className={styles.solucoesCard}>
                <span className={styles.solucoesIcon}>
                  {/* Hourglass icon SVG */}
                  <Image
                    src="/time.svg"
                    alt="Hourglass Icon"
                    width={32}
                    height={40}
                  />
                </span>
                <h4 className={styles.solucoesCardTitle}>Filas?</h4>
                <p className={styles.solucoesCardDesc}>
                  Pedidos diretos pelo tablet/celular, sem espera e com mais
                  agilidade.
                </p>
              </div>
              <div className={styles.solucoesCard}>
                <span className={styles.solucoesIcon}>
                  {/* Lightning icon SVG */}
                  <Image
                    src="/fast.svg"
                    alt="Lightning Icon"
                    width={32}
                    height={40}
                  />
                </span>
                <h4 className={styles.solucoesCardTitle}>
                  Pagamento fácil e rápido!
                </h4>
                <p className={styles.solucoesCardDesc}>
                  Sistema integrado com Pix, cartão e dinheiro para maior
                  rapidez nas transações.
                </p>
              </div>
            </div>
            <div className={styles.solucoesActions}>
              <button className={styles.solucoesBtnPrimary}>Saiba Mais</button>
              <button className={styles.solucoesBtnSecondary}>
                Experimente{" "}
                <span className={styles.solucoesArrow}>&#8250;</span>
              </button>
            </div>
          </div>
          <div className={styles.solucoesRight}>
            <Image
              src="/solutions.png"
              alt="Cliente fazendo pedido pelo tablet"
              width={542}
              height={542}
              className={styles.solucoesImg}
              priority
            />
          </div>
        </div>
      </section>

      {/* Vantagens */}
      <section id="vantagens" className={styles.vantagensSection}>
        <div className={styles.vantagensContent}>
          <h3 className={styles.vantagensLabel}>Vantagens</h3>
          <h2 className={styles.vantagensTitle}>
            Benefícios que <br></br> transformam seu negócio
          </h2>
          <p className={styles.vantagensDesc}>
            Descubra como nosso sistema pode acelerar o atendimento e aumentar
            suas vendas. Com soluções práticas, você otimiza a experiência do
            cliente e melhora a gestão do seu restaurante.
          </p>
          <div className={styles.vantagensGrid}>
            <div className={styles.vantagemCard}>
              <Image
                src="/card.png"
                alt="Atendimento relâmpago"
                width={360}
                height={200}
                className={styles.vantagemImg}
              />
              <h4 className={styles.vantagemCardTitle}>
                Atendimento relâmpago
              </h4>
              <p className={styles.vantagemCardDesc}>
                Aumente a velocidade do seu atendimento em até 40%.
              </p>
            </div>
            <div className={styles.vantagemCard}>
              <Image
                src="/money.png"
                alt="Aumento do ticket médio"
                width={360}
                height={200}
                className={styles.vantagemImg}
              />
              <h4 className={styles.vantagemCardTitle}>
                Aumento do ticket médio
              </h4>
              <p className={styles.vantagemCardDesc}>
                Impulsione suas vendas com sugestões inteligentes e aumente o
                ticket médio em 25%.
              </p>
            </div>
            <div className={styles.vantagemCard}>
              <Image
                src="/support.png"
                alt="Suporte individual"
                width={360}
                height={200}
                className={styles.vantagemImg}
              />
              <h4 className={styles.vantagemCardTitle}>Suporte individual</h4>
              <p className={styles.vantagemCardDesc}>
                Oferecemos treinamento gratuito para sua equipe e suporte 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className={styles.section}>
        <h2 className={styles.sectionTitle}>Escolha o seu plano</h2>
        <p className={styles.sectionDesc}>
          Conheça os planos oferecidos pela Lírio para alavancar o seu negócio!
        </p>
        <div className={styles.planToggle}>
          <button
            className={
              planType === "mensal"
                ? styles.planToggleActive
                : styles.planToggleInactive
            }
            onClick={() => setPlanType("mensal")}
            type="button"
          >
            Mensal
          </button>
          <button
            className={
              planType === "anual"
                ? styles.planToggleActive
                : styles.planToggleInactive
            }
            onClick={() => setPlanType("anual")}
            type="button"
          >
            Anual
          </button>
        </div>
        <div className={styles.plansGrid}>
          <div className={styles.planCard}>
            <h4>Plano Básico</h4>
            <p className={styles.planSubtitle}>
              {planType === "mensal"
                ? "R$250/mês, ideal para pequenos negócios."
                : "R$199/mês no plano anual."}
            </p>
            <div className={styles.planPrice}>{prices[planType].basic}</div>
            <button className={styles.primaryBtn}>Assine já</button>
            <ul className={styles.planFeatures}>
              <li>
                <Image alt="Check" src="/check.svg" width={24} height={24} />{" "}
                Pedidos via QR Code
              </li>
              <li>
                <Image alt="Check" src="/check.svg" width={24} height={24} />{" "}
                Suporte 24/7
              </li>
              <li>
                <Image alt="Check" src="/check.svg" width={24} height={24} />{" "}
                Treinamento gratuito
              </li>
            </ul>
          </div>
          <div className={styles.planCard}>
            <h4>Plano Premium</h4>
            <p className={styles.planSubtitle}>
              {planType === "mensal"
                ? "R$500/mês, suporte VIP."
                : "R$399/mês no plano anual."}
            </p>
            <div className={styles.planPrice}>{prices[planType].premium}</div>
            <button className={styles.primaryBtn}>Assine já</button>
            <ul className={styles.planFeatures}>
              <li>
                <Image alt="Check" src="/check.svg" width={24} height={24} />{" "}
                <span>Plano Básico</span>
              </li>
              <li>
                <Image alt="Check" src="/check.svg" width={24} height={24} />{" "}
                Relatórios avançados
              </li>
              <li>
                <Image alt="Check" src="/check.svg" width={24} height={24} />{" "}
                Suporte prioritário
              </li>
              <li>
                <Image alt="Check" src="/check.svg" width={24} height={24} />{" "}
                Gestão de estoque
              </li>
              <li>
                <Image alt="Check" src="/check.svg" width={24} height={24} />{" "}
                Análises em tempo real
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            Transforme seu
            <br />
            negócio hoje mesmo!
          </h2>
          <div className={styles.ctaRight}>
            <p className={styles.ctaDesc}>
              Inicie agora e aproveite 1 mês de suporte gratuito. Não perca a
              chance de otimizar seu atendimento e aumentar suas vendas!
            </p>
            <div className={styles.ctaActions}>
              <button className={styles.ctaPrimaryButton}>
                Quero Experimentar
              </button>
              <button className={styles.ctaSecondaryButton}>Saiba Mais</button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerTop}>
          <div className={styles.footerLogo}>
            <Image src="/lirio.svg" alt="Lirio Logo" width={104} height={32} />
          </div>
          <div className={styles.footerLinks}>
            <div>
              <h5>Links Rápidos</h5>
              <ul>
                <li>
                  <a href="#">Link Dezesseis</a>
                </li>
                <li>
                  <a href="#">Link Dezessete</a>
                </li>
                <li>
                  <a href="#">Link Dezoito</a>
                </li>
                <li>
                  <a href="#">Link Dezenove</a>
                </li>
                <li>
                  <a href="#">Link Vinte</a>
                </li>
              </ul>
            </div>
            <div>
              <h5>Redes Sociais</h5>
              <ul>
                <li>
                  <a href="#">Link Dezesseis</a>
                </li>
                <li>
                  <a href="#">Link Dezessete</a>
                </li>
                <li>
                  <a href="#">Link Dezoito</a>
                </li>
                <li>
                  <a href="#">Link Dezenove</a>
                </li>
                <li>
                  <a href="#">Link Vinte</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.footerDivider}></div>
        <div className={styles.footerBottom}>
          <div className={styles.footerBottomLeft}>
            © 2024 Lírio. Todos os direitos reservados.
            <span className={styles.footerBottomLinks}>
              <a href="#">Política de Privacidade</a>
              <a href="#">Termos de Serviço</a>
              <a href="#">Configurações de Cookies</a>
            </span>
          </div>
          <div className={styles.footerSocials}>
            <a href="#">
              <Image
                src="/icon-facebook.svg"
                alt="Facebook"
                width={24}
                height={24}
              />
            </a>
            <a href="#">
              <Image
                src="/icon-instagram.svg"
                alt="Instagram"
                width={24}
                height={24}
              />
            </a>
            <a href="#">
              <Image src="/icon-x.svg" alt="X" width={24} height={24} />
            </a>
            <a href="#">
              <Image
                src="/icon-linkedin.svg"
                alt="LinkedIn"
                width={24}
                height={24}
              />
            </a>
            <a href="#">
              <Image
                src="/icon-youtube.svg"
                alt="YouTube"
                width={24}
                height={24}
              />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
