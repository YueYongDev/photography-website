"use client";

import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";

import styles from "./public-site.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const isModifiedClick = (event: MouseEvent) =>
  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;

export const SiteMotion = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const transitionRef = useRef<HTMLDivElement>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const navigatingRef = useRef(false);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.92,
      smoothWheel: true,
      anchors: { offset: -72 },
      stopInertiaOnNavigate: true,
      respectReducedMotion: true,
      prevent: (node) => Boolean(node.closest("[data-lenis-prevent]")),
    });
    const updateScrollTrigger = () => ScrollTrigger.update();
    const tick = (time: number) => lenis.raf(time * 1000);

    lenisRef.current = lenis;
    lenis.on("scroll", updateScrollTrigger);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.off("scroll", updateScrollTrigger);
      lenis.destroy();
      lenisRef.current = null;
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        isModifiedClick(event) ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest<HTMLAnchorElement>("a[href]");
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.hasAttribute("data-no-page-transition")
      ) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;

      const current = new URL(window.location.href);
      const sameDocument =
        destination.pathname === current.pathname &&
        destination.search === current.search;
      if (sameDocument && destination.hash) return;
      if (sameDocument && destination.hash === current.hash) return;

      event.preventDefault();
      if (navigatingRef.current) return;

      const page = root.querySelector<HTMLElement>("main");
      const transition = transitionRef.current;
      if (!page || !transition) {
        router.push(
          `${destination.pathname}${destination.search}${destination.hash}`,
        );
        return;
      }

      navigatingRef.current = true;
      lenisRef.current?.stop();
      gsap.killTweensOf([page, transition]);
      gsap
        .timeline({
          defaults: { ease: "power3.inOut" },
          onComplete: () =>
            router.push(
              `${destination.pathname}${destination.search}${destination.hash}`,
            ),
        })
        .to(page, { autoAlpha: 0.35, y: -14, duration: 0.34 }, 0)
        .fromTo(
          transition,
          { clipPath: "inset(100% 0 0 0)" },
          { clipPath: "inset(0% 0 0 0)", duration: 0.42 },
          0,
        );
    };

    document.addEventListener("click", onDocumentClick, true);
    return () => document.removeEventListener("click", onDocumentClick, true);
  }, [router]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const page = root?.querySelector<HTMLElement>("main");
    if (!root || !page) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const transition = transitionRef.current;
    const routeChildren = Array.from(page.children) as HTMLElement[];
    const wasNavigating = navigatingRef.current;
    const hoverCleanups: Array<() => void> = [];

    gsap.set(page, { clearProps: "opacity,visibility,transform" });

    if (wasNavigating) {
      lenisRef.current?.scrollTo(0, { immediate: true });
    }

    const context = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(routeChildren, { clearProps: "all" });
        if (transition) {
          gsap.set(transition, { clipPath: "inset(0 0 100% 0)" });
        }
        navigatingRef.current = false;
        lenisRef.current?.start();
        return;
      }

      const entrance = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          navigatingRef.current = false;
          lenisRef.current?.start();
        },
      });

      if (transition) {
        if (wasNavigating) {
          entrance.fromTo(
            transition,
            { clipPath: "inset(0% 0 0 0)" },
            { clipPath: "inset(0 0 100% 0)", duration: 0.68 },
            0,
          );
        } else {
          gsap.set(transition, { clipPath: "inset(0 0 100% 0)" });
        }
      }

      entrance.fromTo(
        routeChildren,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.82,
          stagger: 0.07,
          clearProps: "opacity,visibility,transform",
        },
        wasNavigating ? 0.18 : 0.05,
      );

      const revealTargets = gsap.utils.toArray<HTMLElement>(
        "[data-motion-reveal]",
        root,
      );
      revealTargets.forEach((element) => {
        if (!element.offsetParent) return;

        const direction = element.dataset.motionReveal;
        const distance = Number(element.dataset.motionDistance ?? 38);
        const delay = Number(element.dataset.motionDelay ?? 0);
        const from =
          direction === "left"
            ? { x: -distance, y: 0 }
            : direction === "right"
              ? { x: distance, y: 0 }
              : { x: 0, y: distance };

        gsap.fromTo(
          element,
          { ...from, autoAlpha: 0 },
          {
            x: 0,
            y: 0,
            autoAlpha: 1,
            duration: 0.95,
            delay,
            ease: "power3.out",
            clearProps: "opacity,visibility,transform",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              once: true,
            },
          },
        );
      });

      const imageTargets = gsap.utils.toArray<HTMLElement>(
        "[data-motion-image]",
        root,
      );
      imageTargets.forEach((element) => {
        if (!element.offsetParent) return;

        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 30, scale: 1.018 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.05,
            ease: "power3.out",
            clearProps: "opacity,visibility,transform",
            scrollTrigger: {
              trigger: element,
              start: "top 92%",
              once: true,
            },
          },
        );
      });

      const parallaxTargets = gsap.utils.toArray<HTMLElement>(
        "[data-motion-parallax] img",
        root,
      );
      parallaxTargets.forEach((image) => {
        if (!image.offsetParent) return;

        gsap.fromTo(
          image,
          { yPercent: -2.5, scale: 1.035 },
          {
            yPercent: 2.5,
            scale: 1.035,
            ease: "none",
            scrollTrigger: {
              trigger: image.parentElement ?? image,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.7,
            },
          },
        );
      });

      const hoverTargets = gsap.utils.toArray<HTMLElement>(
        "[data-motion-hover]",
        root,
      );
      hoverTargets.forEach((element) => {
        if (
          !element.offsetParent ||
          !window.matchMedia("(hover: hover) and (pointer: fine)").matches
        ) {
          return;
        }

        const yTo = gsap.quickTo(element, "y", {
          duration: 0.42,
          ease: "power3.out",
        });
        const scaleTo = gsap.quickTo(element, "scale", {
          duration: 0.42,
          ease: "power3.out",
        });
        const enter = () => {
          yTo(-4);
          scaleTo(1.008);
        };
        const leave = () => {
          yTo(0);
          scaleTo(1);
        };

        element.addEventListener("pointerenter", enter);
        element.addEventListener("pointerleave", leave);
        hoverCleanups.push(() => {
          element.removeEventListener("pointerenter", enter);
          element.removeEventListener("pointerleave", leave);
        });
      });
    }, root);

    const refreshFrame = window.requestAnimationFrame(() =>
      ScrollTrigger.refresh(),
    );

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      hoverCleanups.forEach((cleanup) => cleanup());
      context.revert();
    };
  }, [pathname]);

  return (
    <div ref={rootRef} className={styles.motionRoot}>
      {children}
      <div
        ref={transitionRef}
        className={styles.motionTransition}
        aria-hidden="true"
      />
    </div>
  );
};
