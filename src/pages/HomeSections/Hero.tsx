import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { NmaGlassButton } from "../../components/ui/nma-glass";

export default function Hero() {
  const desktopVideoRef = useRef<HTMLVideoElement | null>(null);
  const mobileVideoRef = useRef<HTMLVideoElement | null>(null);

  const scrollToCourses = () => {
    document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const videos = [desktopVideoRef.current, mobileVideoRef.current].filter(
      Boolean
    ) as HTMLVideoElement[];

    videos.forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.controls = false;
      video.disablePictureInPicture = true;

      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay fallback: user gesture will restart if browser blocks it.
        });
      }
    });
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-nma-darker">
      {/* DESKTOP VIDEO BACKGROUND */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
        className="
          hidden
          md:block
          absolute
          inset-y-0
          right-[-4vw]
          w-[88vw]
          z-0
          pointer-events-none
          overflow-hidden
        "
      >
        <video
          ref={desktopVideoRef}
          className="
            hero-panther-video
            absolute
            bottom-0
            right-0
            w-full
            h-auto
            object-contain
            mix-blend-lighten
            pointer-events-none
            select-none
          "
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/assets/images/panther-fallback.png"
          disablePictureInPicture
          disableRemotePlayback
          controls={false}
          controlsList="nodownload nofullscreen noplaybackrate noremoteplayback"
          aria-hidden="true"
          tabIndex={-1}
          onContextMenu={(e) => e.preventDefault()}
        >
          <source
            src="/assets/videohero/panther-hero-desktop.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute bottom-8 right-[9vw] text-[0.625rem] uppercase tracking-[2px] text-nma-purple font-mono opacity-40">
          PRIME AMBITION // NMA_V1
        </div>
      </motion.div>

      {/* MOBILE LAYOUT */}
      <div
        className="
          md:hidden
          relative
          min-h-[100svh]
          flex
          flex-col
          bg-nma-darker
          overflow-hidden
        "
      >
        {/* Mobile text */}
        <div className="relative z-30 px-6 pt-28 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: "easeOut" }}
            className="flex flex-col text-left"
          >
            <span className="text-nma-purple font-bold text-[0.7rem] uppercase tracking-[0.27em] block mb-4">
              NATIUNEA MARILOR ANTREPRENORI
            </span>

            <motion.h1
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1.1,
                delay: 0.35,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="
                text-[clamp(3rem,13.7vw,5rem)]
                font-[800]
                tracking-[-0.048em]
                text-transparent
                bg-clip-text
                bg-gradient-to-r
                from-white
                to-nma-silver
                mb-7
                leading-[0.98]
              "
            >
              CASTIGA-TI LIBERTATEA.
              <br />
              ACUM E TIMPUL.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.65 }}
              className="
                text-[1.04rem]
                leading-[1.62]
                text-nma-silver
                opacity-75
                mb-8
                max-w-[31rem]
              "
            >
              Strategie. Executie. Rezultate. Locul pentru cei care
              vor sa construiasca o afacere reala, nu doar o sursa de motivatie.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.85 }}
              className="flex flex-col gap-4"
            >
              <NmaGlassButton
                glow="purple"
                onClick={scrollToCourses}
                className="
                  px-8
                  py-4
                  min-h-[3.75rem]
                  text-[0.875rem]
                  font-bold
                  text-white
                  uppercase
                  tracking-[0.12em]
                  rounded-full
                  transition-all
                  w-full
                  text-center
                "
              >
                Incepe Acum
              </NmaGlassButton>

              <NmaGlassButton
                glow="subtle"
                asChild
                className="
                  px-8
                  py-4
                  min-h-[3.75rem]
                  text-[0.875rem]
                  font-semibold
                  text-white
                  bg-transparent
                  border
                  border-white/20
                  rounded-full
                  hover:bg-white/5
                  transition-all
                  w-full
                  text-center
                  flex
                  items-center
                  justify-center
                "
              >
                <a href="#manifesto">
                  Vezi Sistemul
                </a>
              </NmaGlassButton>
            </motion.div>
          </motion.div>
        </div>

        {/* Mobile video stage */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.15, delay: 0.25, ease: "easeOut" }}
          className="
            relative
            z-10
            flex-1
            min-h-[52svh]
            overflow-hidden
            pointer-events-none
            bg-black
            border-y
            border-white/[0.035]
          "
        >
          <video
            ref={mobileVideoRef}
            className="
              hero-panther-video
              absolute
              inset-0
              w-full
              h-full
              object-cover
              object-center
              mix-blend-lighten
              pointer-events-none
              select-none
            "
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/assets/images/panther-fallback.png"
            disablePictureInPicture
            disableRemotePlayback
            controls={false}
            controlsList="nodownload nofullscreen noplaybackrate noremoteplayback"
            aria-hidden="true"
            tabIndex={-1}
            onContextMenu={(e) => e.preventDefault()}
          >
            <source
              src="/assets/videohero/panther-hero-mobile.mp4"
              type="video/mp4"
            />
          </video>

          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-nma-darker to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-nma-darker to-transparent" />

          <div className="absolute bottom-[3rem] right-[7vw] text-[0.58rem] uppercase tracking-[0.22em] text-nma-purple font-mono opacity-35">
            PRIME AMBITION // NMA_V1
          </div>
        </motion.div>
      </div>

      {/* DESKTOP CONTENT */}
      <div
        className="
          hidden
          md:flex
          relative
          z-20
          max-w-7xl
          mx-auto
          px-6
          pt-28
          pb-16
          min-h-[95vh]
          flex-col
          justify-center
        "
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative z-30 flex flex-col text-left max-w-[45rem]"
        >
          <span className="text-nma-purple font-bold text-[0.75rem] uppercase tracking-[0.3em] block mb-4">
            NATIUNEA MARILOR ANTREPRENORI
          </span>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 1.15,
              delay: 0.4,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="
              text-[3.5rem]
              font-[800]
              tracking-[-0.045em]
              text-transparent
              bg-clip-text
              bg-gradient-to-r
              from-white
              to-nma-silver
              mb-8
              leading-[0.98]
            "
          >
            CASTIGA-TI LIBERTATEA.
            <br />
            ACUM E TIMPUL.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.75 }}
            className="
              text-[1.125rem]
              leading-[1.65]
              text-nma-silver
              opacity-75
              max-w-[31rem]
              mb-10
            "
          >
            Strategie. Executie. Rezultate. Locul pentru cei care
            vor sa construiasca o afacere reala, nu doar o sursa de motivatie.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.95 }}
            className="flex flex-row items-center gap-4"
          >
            <NmaGlassButton
              glow="purple"
              onClick={scrollToCourses}
              className="
                px-8
                py-4
                min-h-[3.75rem]
                text-[0.875rem]
                font-bold
                text-white
                uppercase
                tracking-[0.12em]
                rounded-full
                transition-all
                text-center
              "
            >
              Incepe Acum
            </NmaGlassButton>

            <NmaGlassButton
              glow="subtle"
              asChild
              className="
                px-8
                py-4
                min-h-[3.75rem]
                text-[0.875rem]
                font-semibold
                text-white
                bg-transparent
                border
                border-white/20
                rounded-full
                hover:bg-white/5
                transition-all
                text-center
                flex
                items-center
                justify-center
              "
            >
              <a href="#manifesto">
                Vezi Sistemul
              </a>
            </NmaGlassButton>
          </motion.div>
        </motion.div>
      </div>

      {/* DESKTOP SCROLL INDICATOR */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="
          hidden
          md:flex
          absolute
          bottom-8
          left-1/2
          -translate-x-1/2
          flex-col
          items-center
          gap-2
          text-white/30
          z-20
        "
      >
        <span className="text-[0.625rem] uppercase tracking-widest font-mono">
          Scroll
        </span>
        <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
      </motion.div>
    </section>
  );
}
