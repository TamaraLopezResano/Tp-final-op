"use client";

import { useEffect, useState } from "react";
import Pieza from "./piece";

export default function Board(props) {

    const convertirNumeroALetra = (numero) => {
        const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        return letras.charAt(numero - 1);
    };

    const numbers = [1, 2, 3, 4, 5, 6, 7, 8];

    const ranks = numbers.map((i) => i);
    const files = numbers.map((i) => 9 - i);

    const [importedBoard, setImportedBoard] = useState([])
    
    useEffect(() => {
        setImportedBoard(props.array);
        }, [props.array]);

    function getClassname(i, j) {
        let c = '';
        c += (i + j) % 2 === 0 ? 'square--dark' : 'square--light';
        return c;
    }

    return (
        <>
            <div className="files">
                {files.map((file, i) => (<p key={i} className="file">{file}</p>))}
            </div>
            <div className="board">
                {importedBoard.map((square) => {
                    return(
                        <div key={`${square.id}`} onClick={props.funcion} id={String(square.id)} className={getClassname(parseInt(square.id[0]), parseInt(square.id[1]))}>
                            {square.piece[0] && square.piece[0].colour === true ? (
                                <Pieza pieza={"white" + square.piece[0].name}/>
                            ) : square.piece[0] && square.piece[0].colour === false ? (
                                <Pieza pieza={"black" + square.piece[0].name}/>
                            ) : null}
                        </div>
                    )
                })}
            </div>
            <div className="ranks">
                {ranks.map((rank, i) => (<p key={i} className="rank">{convertirNumeroALetra(rank)}</p>))}
            </div>
        </>
    );
}