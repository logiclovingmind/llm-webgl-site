type PhotoProps = {
  src: string
  alt?: string
  className?: string
  eager?: boolean
}

/** 8K source framed by the .photo neon grading (cyan/magenta + scanline + vignette). */
export default function Photo({ src, alt = '', className, eager = false }: PhotoProps) {
  return (
    <div className={`photo ${className ?? ''}`}>
      <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
    </div>
  )
}
