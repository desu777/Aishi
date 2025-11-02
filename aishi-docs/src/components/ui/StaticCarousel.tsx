'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

import './StaticCarousel.css'

type CarouselItem = {
  src: string
  alt: string
}

interface StaticCarouselProps {
  items: CarouselItem[]
  onSelect?: (src: string) => void
}

export default function StaticCarousel({ items, onSelect }: StaticCarouselProps) {
  const [index, setIndex] = useState(0)

  const slides = useMemo(() => items ?? [], [items])
  const maxIndex = Math.max(0, slides.length - 1)

  useEffect(() => {
    setIndex((current) => Math.min(current, maxIndex))
  }, [maxIndex])

  const go = (delta: number) => {
    setIndex((current) => {
      const next = Math.min(Math.max(current + delta, 0), maxIndex)
      return next
    })
  }

  const handleDotClick = (target: number) => {
    setIndex(target)
  }

  const canPrev = index > 0
  const canNext = index < maxIndex

  return (
    <div className="carousel">
      <div className="carousel__navGroup">
        <button
          type="button"
          className="carousel__navButton"
          onClick={() => go(-1)}
          disabled={!canPrev}
          aria-label="Previous"
        >
          <FiChevronLeft size={20} />
        </button>
        <button
          type="button"
          className="carousel__navButton"
          onClick={() => go(1)}
          disabled={!canNext}
          aria-label="Next"
        >
          <FiChevronRight size={20} />
        </button>
      </div>

      <div className="carousel__frame">
        <div className="carousel__viewport" style={{ transform: `translateX(-${index * 100}%)` }}>
          {slides.map((item, idx) => (
            <div className="carousel__slide" key={item.src}>
              <figure className="carousel__item" onClick={() => onSelect?.(item.src)}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="carousel__img"
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
                <figcaption>{item.alt}</figcaption>
              </figure>
            </div>
          ))}
        </div>
      </div>

      <div className="carousel__controls">
        {slides.map((_, dot) => (
          <button
            key={dot}
            type="button"
            className={`carousel__dot ${dot === index ? 'carousel__dot--active' : ''}`}
            onClick={() => handleDotClick(dot)}
            aria-label={`Go to slide ${dot + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
