"use client"

import Image from 'next/image'

export default function piece(props){

    let source = "/" + props.pieza + ".png"

    return(
        <Image 
        src = {source}
        width = {70}
        height = {70}
        alt={props.pieza}
        priority={true}
        style={{ pointerEvents: 'none' }}/>
    )
}