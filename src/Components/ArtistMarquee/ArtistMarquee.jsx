import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { getUserImage } from "../../../redux/users/selectors.js";
import {
  createSmoothScroll,
  getWheelScrollDelta,
} from "../../utils/horizontalScroll.js";
import { attachHorizontalSwipe } from "../../utils/horizontalSwipe.js";
import css from "./ArtistMarquee.module.css";

function ArtistMarquee({ authors, location, direction, label }) {
  const viewportRef = useRef(null);
  const trackRef = useRef(null);
  const firstCardRef = useRef(null);
  const pointerFocusRef = useRef(false);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const [layout, setLayout] = useState({ repetitions: 1, duration: 40 });

  useEffect(() => {
    const viewport = viewportRef.current;
    const firstCard = firstCardRef.current;

    if (!viewport || !firstCard || !authors.length) return;

    const observer = new ResizeObserver(() => {
      const gap =
        parseFloat(getComputedStyle(firstCard.parentElement).columnGap) || 0;
      const sequenceWidth =
        authors.length * (firstCard.getBoundingClientRect().width + gap);

      if (!sequenceWidth) return;

      const repetitions = Math.max(
        1,
        Math.ceil(viewport.clientWidth / sequenceWidth),
      );
      const duration = (sequenceWidth * repetitions) / 40;

      setLayout((current) =>
        current.repetitions === repetitions && current.duration === duration
          ? current
          : { repetitions, duration },
      );
    });

    observer.observe(viewport);
    observer.observe(firstCard);

    return () => observer.disconnect();
  }, [authors.length]);

  useEffect(() => {
    const viewport = viewportRef.current;

    let remainder = 0;
    const scrollBy = (delta) => {
      const track = trackRef.current;
      const animation = track.getAnimations()[0];

      if (animation) {
        const duration = animation.effect.getComputedTiming().duration;
        const loopWidth = track.firstElementChild.getBoundingClientRect().width;

        if (!loopWidth || !Number.isFinite(duration) || duration <= 0) return;

        const timeDelta =
          (delta / loopWidth) * duration * (direction === "right" ? -1 : 1);
        const nextTime = (animation.currentTime || 0) + timeDelta;

        animation.currentTime = ((nextTime % duration) + duration) % duration;
      } else {
        const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;

        if (maxScrollLeft <= 0) return;

        const nextScrollLeft = Math.max(
          0,
          Math.min(viewport.scrollLeft + delta + remainder, maxScrollLeft),
        );
        viewport.scrollLeft = nextScrollLeft;
        remainder = nextScrollLeft - viewport.scrollLeft;
      }
    };
    const smoothScroll = createSmoothScroll(scrollBy);
    const removeSwipe = attachHorizontalSwipe(viewport, {
      onStart: () => {
        smoothScroll.cancel();
        viewport.dataset.touchActive = "true";
      },
      onMove: scrollBy,
      onEnd: () => {
        delete viewport.dataset.touchActive;
      },
    });
    const resetPointerFocus = () => {
      pointerFocusRef.current = false;
    };

    const scrollWithWheel = (event) => {
      if (event.ctrlKey) return;
      if (
        !trackRef.current.getAnimations().length &&
        viewport.scrollWidth <= viewport.clientWidth
      )
        return;

      event.preventDefault();
      smoothScroll.scrollBy(getWheelScrollDelta(event, viewport));
    };

    viewport.addEventListener("wheel", scrollWithWheel, { passive: false });
    document.addEventListener("keydown", resetPointerFocus, true);
    return () => {
      viewport.removeEventListener("wheel", scrollWithWheel);
      document.removeEventListener("keydown", resetPointerFocus, true);
      removeSwipe();
      smoothScroll.cancel();
    };
  }, [direction, keyboardFocused]);

  return (
    <div
      className={css.viewport}
      ref={viewportRef}
      data-keyboard-focused={keyboardFocused}
      onPointerDownCapture={() => {
        pointerFocusRef.current = true;
      }}
      onFocusCapture={() => {
        if (!pointerFocusRef.current) setKeyboardFocused(true);
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setKeyboardFocused(false);
        }
      }}
    >
      <div
        ref={trackRef}
        className={`${css.track} ${direction === "right" ? css.moveRight : ""}`}
        style={{ "--artist-duration": `${layout.duration}s` }}
      >
        {[0, 1].map((copy) => (
          <ul
            className={css.list}
            key={copy}
            aria-label={copy === 0 ? label : undefined}
            aria-hidden={copy === 1 ? true : undefined}
          >
            {Array.from({ length: layout.repetitions }, (_, repetition) =>
              authors.map((author, index) => {
                const isDuplicate = copy > 0 || repetition > 0;
                const banner = getUserImage(author.avatar, 2);

                return (
                  <li
                    className={css.item}
                    key={`${repetition}-${author._id}`}
                    ref={
                      copy === 0 && repetition === 0 && index === 0
                        ? firstCardRef
                        : undefined
                    }
                    aria-hidden={isDuplicate ? true : undefined}
                  >
                    <Link
                      to={`/catalog?${new URLSearchParams({ author: author.username })}`}
                      state={{ from: location }}
                      className={css.link}
                      draggable={false}
                      aria-label={`View works by ${author.username}`}
                      tabIndex={isDuplicate ? -1 : undefined}
                    >
                      {banner && (
                        <img
                          className={css.image}
                          draggable={false}
                          src={banner}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          width="400"
                          height="225"
                        />
                      )}
                      <span className={css.name}>{author.username}</span>
                    </Link>
                  </li>
                );
              }),
            )}
          </ul>
        ))}
      </div>
    </div>
  );
}

export default ArtistMarquee;
