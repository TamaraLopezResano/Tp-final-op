"use client"

import WhiteBoard from "@/components/whiteBoard.jsx"
import BlackBoard from "@/components/blackBoard.jsx"
import { useEffect, useState } from "react"
import io from "socket.io-client";

let contadorAlPaso = 0

export const useSocket = (serverUrl = "ws://localhost:4000", options = { withCredentials: true }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketIo = io(serverUrl, options);

    socketIo.on('connect', () => {
      setIsConnected(true);
      console.log('WebSocket connected.');
    });

    socketIo.on('disconnect', () => {
      setIsConnected(false);
      console.log('WebSocket disconnected.'); 
    });

    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, [serverUrl, JSON.stringify(options)]);

  return { socket, isConnected };
};

export default function Home() {

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8];
  const ranks = numbers.map((i) => i);
  const files = numbers.map((i) => 9 - i);
  const { socket, isConnected } = useSocket();
  const [turnoDe, setTurnoDe] =useState("blanco");
  const [colorMio, setColorMio] = useState("")
  const [Board, setBoard] = useState([])
  const [piezaSeleccionada, setPiezaSeleccionada] = useState([])
  const [squarePiezaSeleccionada, setSquarePiezaSeleccionada] = useState()
  const [seleccion, setSeleccion] = useState(false)
  const [turno, setTurno] = useState(true)
  const [castleShort, setCastleShort] = useState(true)
  const [castleLong, setCastleLong] = useState(true)
  const [castleShortBlack, setCastleShortBlack] = useState(true)
  const [castleLongBlack, setCastleLongBlack] = useState(true)
  let contador = false
  let alPasoide = false
  let contadoraso = 0
  const [endGame, setEndGame] = useState(false)

  class square{
    constructor(id, piece){
        this.id = id
        this.piece = piece
    }
  }

  class piece{
    /**
     * @param {String} name 
     * @param {Boolean} colour 
     */
    constructor(name, colour){
      this.name = name
      this.colour = colour
      this.enPassant = false
    }
  }

  function fuseNumbers(x, y){
    let position = String(x) + String(y)
    return position
  }
  useEffect(() => {
    if (isConnected ) {
      socket.emit('partida', { listo:true });
    }
  }, [isConnected]);

  useEffect(() => {
    if (socket) {
      socket.on('recibirMovimiento', (data) => {
        setBoard(data.board)
        setTurnoDe(data.turnoDe)
        console.log(turnoDe, "turnoDe")
      });
    };
    return () => {
      if (socket) socket.off('recibirMovimiento');
    };
  }, [socket]);

  useEffect(() => {
    if (socket) {
      socket.on('colorAsignado', (data) => {
        setColorMio(data.color)
        console.log(colorMio, "colorMio")
      });
    };

    return () => {
      if (socket) socket.off('colorAsignado');
    };
  }, [socket]);

  useEffect(() => {
    if(contador === false){
      for(let i = 0; i < files.length; i++){
        for(let j = 0; j < ranks.length; j++){
            Board.push(
              new square(fuseNumbers(i + 1, j + 1), [])
            )
          }
      }
      /* 
      for(let i = 0; i < Board.length; i++){
        if (Board[i].id[0] === "2"){
          Board[i].piece.push(new piece("Pawn", false))
        } else if(Board[i].id[0] === "7"){
          Board[i].piece.push(new piece("Pawn", true))
        } else if(Board[i].id === "12" || Board[i].id === "17"){
          Board[i].piece.push(new piece("Knight", false))
        } else if(Board[i].id === "82" || Board[i].id === "87"){
          Board[i].piece.push(new piece("Knight", true))
        } else if(Board[i].id === "13" || Board[i].id === "16"){
          Board[i].piece.push(new piece("Bishop", false))
        } else if(Board[i].id === "83" || Board[i].id === "86"){
          Board[i].piece.push(new piece("Bishop", true))
        } else if(Board[i].id === "11" || Board[i].id === "18"){
          Board[i].piece.push(new piece("Rook", false))
        } else if(Board[i].id === "81" || Board[i].id === "88"){
          Board[i].piece.push(new piece("Rook", true))
        } else if(Board[i].id === "14"){
          Board[i].piece.push(new piece("Queen", false))
        } else if(Board[i].id === "84"){
          Board[i].piece.push(new piece("Queen", true))
        } else if(Board[i].id === "15"){
          Board[i].piece.push(new piece("King", false))
        } else if(Board[i].id === "85"){
          Board[i].piece.push(new piece("King", true))
        } 
      }*/
      console.log(Board)
      Board[40].piece.push(new piece("Pawn", true))
      Board[61].piece.push(new piece("King", true))
      Board[4].piece.push(new piece("King", false))

      contador = true
    }
  }, [])



  function movePiece(e){
      if(seleccion === false){
        for(let i = 0; i < Board.length; i++){
          if(Board[i].id === e.target.id && Board[i].piece.length === 1){
            setPiezaSeleccionada(Board[i].piece[0])
            setSquarePiezaSeleccionada(Board[i].id)
            setSeleccion(true)
          }
        }
      }else if(seleccion === true){
        let chequeo = false
        
        let copyBoard = JSON.parse(JSON.stringify(Board))

        for(let i = 0; i < Board.length; i++){
          if(Board[i].id === e.target.id){
            Board[i].piece.pop()
            for(let j = 0; j < Board.length; j++){
              if(Board[j].id === squarePiezaSeleccionada){
                Board[j].piece.pop()
              }
            }
            Board[i].piece.push(piezaSeleccionada)
            for(let j = 0; j < Board.length; j++){
              if(Board[j].piece.length != 0 && Board[j].piece[0].name === "King" &&  Board[j].piece[0].colour === piezaSeleccionada.colour){
                chequeo = check(Board[j], Board)
    
              }
            }
          }
        }
        for(let i = 0; i < Board.length; i++){
          Board[i].piece.pop()
          if(copyBoard[i].piece.length != 0){
            Board[i].piece.push(copyBoard[i].piece[0])
          }
        }
        if(chequeo === false){
          if(pieceMovements(piezaSeleccionada, squarePiezaSeleccionada, e.target.id, false) === "castleShort" && 
            checkMidPieces(piezaSeleccionada, squarePiezaSeleccionada, e.target.id) === true &&
            piezaSeleccionada.colour === turno){
              let intermidiateWhiteSquare = []
              let intermidiateBlackSquare = []
              intermidiateWhiteSquare.push(Board[60])
              intermidiateBlackSquare.push(Board[4])
              intermidiateWhiteSquare[0].id = JSON.parse(JSON.stringify(Board[61].id))
              intermidiateBlackSquare[0].id = JSON.parse(JSON.stringify(Board[5].id))
              if(piezaSeleccionada.colour === true &&
                check(intermidiateWhiteSquare[0], Board) === false &&
                check(Board[60], Board) === false){
                Board[63].piece.pop()
                Board[61].piece.push(new piece("Rook", piezaSeleccionada.colour))
                Board[60].piece.pop()
                Board[62].piece.push(new piece("King", piezaSeleccionada.colour))
                setCastleShort(false) 
                setCastleLong(false)
                setTurno(false)
                if(contadorAlPaso !== 1){
                  for(let i = 0; i < Board.length ; i++){
                    alPasoFalse()
                  }
                  contadorAlPaso = 0
                }
              } else if(piezaSeleccionada.colour === false &&
                check(intermidiateBlackSquare[0], Board) === false  &&
                check(Board[4], Board) === false){
                Board[7].piece.pop()
                Board[5].piece.push(new piece("Rook", piezaSeleccionada.colour))
                Board[4].piece.pop()
                Board[6].piece.push(new piece("King", piezaSeleccionada.colour))
                setCastleShortBlack(false) 
                setCastleLongBlack(false)
                setTurno(true)
                if(contadorAlPaso !== 1){
                  for(let i = 0; i < Board.length ; i++){
                    alPasoFalse()
                  }
                  contadorAlPaso = 0
                }
              }
              Board[60].id = "85"
              Board[4].id = "15"
          } else if(pieceMovements(piezaSeleccionada, squarePiezaSeleccionada, e.target.id, false) === "castleLong" && 
          checkMidPieces(piezaSeleccionada, squarePiezaSeleccionada, e.target.id) === true &&
          piezaSeleccionada.colour === turno){
            let intermidiateWhiteSquare = []
            let intermidiateBlackSquare = []
            intermidiateWhiteSquare.push(Board[60])
            intermidiateBlackSquare.push(Board[4])
            intermidiateWhiteSquare[0].id = JSON.parse(JSON.stringify(Board[59].id))
            intermidiateBlackSquare[0].id = JSON.parse(JSON.stringify(Board[3].id))
            if(piezaSeleccionada.colour === true && 
              check(intermidiateWhiteSquare[0], Board) === false && 
              check(Board[60], Board) === false){
              Board[56].piece.pop()
              Board[59].piece.push(new piece("Rook", piezaSeleccionada.colour))
              Board[60].piece.pop()
              Board[58].piece.push(new piece("King", piezaSeleccionada.colour))
              setCastleShort(false) 
              setCastleLong(false)
              setTurno(false)
              if(contadorAlPaso !== 1){
                for(let i = 0; i < Board.length ; i++){
                  alPasoFalse()
                }
                contadorAlPaso = 0
              }
            } else if(piezaSeleccionada.colour === false && 
              check(intermidiateBlackSquare[0], Board) === false  &&
              check(Board[4], Board) === false){
              Board[0].piece.pop()
              Board[3].piece.push(new piece("Rook", piezaSeleccionada.colour))
              Board[4].piece.pop()
              Board[2].piece.push(new piece("King", piezaSeleccionada.colour))
              setCastleShortBlack(false) 
              setCastleLongBlack(false)
              setTurno(true)
              if(contadorAlPaso !== 1){
                for(let i = 0; i < Board.length ; i++){
                  alPasoFalse()
                }
                contadorAlPaso = 0
              }
            }
            Board[60].id = "85"
            Board[4].id = "15"
        } else if(pieceMovements(piezaSeleccionada, squarePiezaSeleccionada, e.target.id, false) === "coronacion" && 
        checkMidPieces(piezaSeleccionada, squarePiezaSeleccionada, e.target.id) === true &&
        piezaSeleccionada.colour === turno){
          for(let i = 0; i < Board.length; i++){
            for(let j = 0; j < Board.length; j++){
              if(Board[j].id === squarePiezaSeleccionada && Board[i].id === e.target.id){
                Board[j].piece.pop()
                Board[i].piece.pop()
                Board[i].piece.push(new piece("Queen", piezaSeleccionada.colour))
                if(turno === true){
                  setTurno(false)
                } else{
                  setTurno(true)
                }
                if(contadorAlPaso !== 1){
                  for(let i = 0; i < Board.length ; i++){
                    alPasoFalse()
                  }
                  contadorAlPaso = 0
                }
              }
            } 
          }
        } else if(pieceMovements(piezaSeleccionada, squarePiezaSeleccionada, e.target.id, false) === "enPassant" && 
        piezaSeleccionada.colour === turno){
          if(piezaSeleccionada.colour === true){
            for(let i = 0; i < Board.length; i++){
              for(let j = 0; j < Board.length; j++){
                if(Board[j].id === squarePiezaSeleccionada && Board[i].id === e.target.id){
                  Board[j].piece.pop()
                  Board[i + 8].piece.pop()
                  if(contadorAlPaso !== 1){
                    for(let i = 0; i < Board.length ; i++){
                      alPasoFalse()
                    }
                    contadorAlPaso = 0
                  }
                  Board[i].piece.push(piezaSeleccionada)
                }
              }
            }
          } else if(piezaSeleccionada.colour === false){
            for(let i = 0; i < Board.length; i++){
              for(let j = 0; j < Board.length; j++){
                if(Board[j].id === squarePiezaSeleccionada && Board[i].id === e.target.id){
                  Board[j].piece.pop()
                  Board[i - 8].piece.pop()
                  if(contadorAlPaso !== 1){
                    for(let i = 0; i < Board.length ; i++){
                      alPasoFalse()
                    }
                    contadorAlPaso = 0
                  }
                  Board[i].piece.push(piezaSeleccionada)
                }
              }
            }
          }
          if(turno === true){
            setTurno(false)
          } else{
            setTurno(true)
          }
        } else{
          for(let i = 0; i < Board.length; i++){
            if (Board[i].piece.length != 0) {
              if(Board[i].id === e.target.id && Board[i].piece[0].colour !== piezaSeleccionada.colour && 
              pieceMovements(piezaSeleccionada, squarePiezaSeleccionada, e.target.id, false) === true && 
              checkMidPieces(piezaSeleccionada, squarePiezaSeleccionada, e.target.id) === true &&
              piezaSeleccionada.colour === turno){
                for(let j = 0; j < Board.length; j++){
                  if(Board[j].id === squarePiezaSeleccionada){
                    Board[j].piece.pop()
                    Board[i].piece.pop()
                  }
                }
                if(alPasoide === true){
                  piezaSeleccionada.enPassant = true
                }
                Board[i].piece.push(piezaSeleccionada)
                if(turno === true){
                  setTurno(false)
                } else{
                  setTurno(true)
                }
                if(contadorAlPaso !== 1){
                  for(let i = 0; i < Board.length ; i++){
                    alPasoFalse()
                  }
                  contadorAlPaso = 0
                }
              }
            } else {
              if(Board[i].id === e.target.id && 
              pieceMovements(piezaSeleccionada, squarePiezaSeleccionada, e.target.id, false) === true && 
              checkMidPieces(piezaSeleccionada, squarePiezaSeleccionada, e.target.id) === true &&
              piezaSeleccionada.colour === turno){
                for(let j = 0; j < Board.length; j++){
                  if(Board[j].id === squarePiezaSeleccionada){
                    Board[j].piece.pop()
                    Board[i].piece.pop()
                  }
                }
                if(alPasoide === true){
                  piezaSeleccionada.enPassant = true
                }
                Board[i].piece.push(piezaSeleccionada)  
                if(turno === true){
                  setTurno(false)
                } else{
                  setTurno(true)
                }
                if(contadorAlPaso !== 1){
                  for(let i = 0; i < Board.length ; i++){
                    alPasoFalse()
                  }
                  contadorAlPaso = 0
                }
              }
            }
          }
        }
      }
      setSeleccion(false)
      if(staleMate() === false){
        setEndGame(true)
        console.log(endGame)
      }
    }
  }

  function pieceMovements(pieza, initialSquare, finalSquare, externalUse){
    let flotante = finalSquare[0] - initialSquare[0];
    let flotante2 = finalSquare[1] - initialSquare[1];
    let capturablePiece = false
    let pieceAhead = false
    let peonAlPasoMenos = false
    let peonAlPasoMas = false
    
    for(let i = 0; i < Board.length; i++){
      if(Board[i].id === initialSquare && externalUse === false){
        let menos1 = i - 1
        let mas1 = i + 1  
        if(mas1 > 1 && menos1 < 62 && Board[menos1].piece != 0 &&  Board[menos1].piece[0].enPassant === true){
          peonAlPasoMenos = true
        } else if(mas1 > 1 && menos1 < 62 && Board[mas1].piece != 0 && Board[mas1].piece[0].enPassant === true){
          peonAlPasoMas = true
        }
      } else if(Board[i].id === finalSquare){
        if(Board[i].piece.length === 1 && flotante2 === 0){
          pieceAhead = true
        } else if(Board[i].piece.length === 1){
          capturablePiece = true
        }
      }
    }

    if(pieza.name === "Pawn"){
      if(parseInt(finalSquare[0]) === 1 && pieza.colour === true  && pieceAhead === false && flotante2 === 0 && flotante === 1){
        return "coronacion"
      } else if(parseInt(finalSquare[0]) === 8 && pieza.colour === false && pieceAhead === false && flotante2 === 0 && flotante === -1){
        return "coronacion"
      } else if(parseInt(initialSquare[0]) === 2 && pieza.colour === false){
        if(capturablePiece === true){
          if(pieza.colour === true && flotante2 === 1 && flotante === -1){
            return true
          } else if(pieza.colour === false && flotante2 === -1 && flotante === 1){
            return true
          } else if(pieza.colour === true && flotante2 === -1 && flotante === -1){
            return true
          } else if(pieza.colour === false && flotante2 === 1 && flotante === 1){
            return true 
          }
        }
        if(flotante2 === 0 && flotante === 2){
          if(externalUse === false){
            alPaso()
          }
          return true
        } else if(flotante2 === 0 && flotante === 1){
          return true
        }
      } else if(parseInt(initialSquare[0]) === 7 && pieza.colour === true){
        if(capturablePiece === true){
          if(pieza.colour === true && flotante2 === 1 && flotante === -1){
            return true
          } else if(pieza.colour === false && flotante2 === -1 && flotante === 1){
            return true
          } else if(pieza.colour === true && flotante2 === -1 && flotante === -1){
            return true
          } else if(pieza.colour === false && flotante2 === 1 && flotante === 1){
            return true 
          }
        }
        if(flotante2 === 0 && flotante === -2){
          if(externalUse === false){
            alPaso()
          }
          return true
        } else if(flotante2 === 0 && flotante === -1){
          return true
        }
      } else if (peonAlPasoMas === true){
        if(parseInt(initialSquare[0]) === 4 && pieza.colour === true){
          if(flotante2 === 1 && flotante === -1){
            return "enPassant"
          }
        } else if(parseInt(initialSquare[0]) === 5 && pieza.colour === false){
          if(flotante2 === 1 && flotante === 1){
            return "enPassant"
          }
        }
      } else if (peonAlPasoMenos === true){
        if(parseInt(initialSquare[0]) === 4 && pieza.colour === true){
          if(flotante2 === -1 && flotante === -1){
            return "enPassant"
          }
        } else if(parseInt(initialSquare[0]) === 5 && pieza.colour === false){
          if(flotante2 === -1 && flotante === 1){
            return "enPassant"
          }
        }
      } else if(capturablePiece === true){
        if(pieza.colour === true && flotante2 === 1 && flotante === -1){
          return true
        } else if(pieza.colour === false && flotante2 === -1 && flotante === 1){
          return true
        } else if(pieza.colour === true && flotante2 === -1 && flotante === -1){
          return true
        } else if(pieza.colour === false && flotante2 === 1 && flotante === 1){
          return true 
        }
      } else if(pieceAhead === true){
        return false
      } else {
        if(pieza.colour === true && flotante2 === 0 && flotante === -1){
          return true
        } else if(pieza.colour === false && flotante2 === 0 && flotante === 1){
          return true
        } else{
          return false
        }
      }
    } else if(pieza.name === "Rook"){
      if(flotante === 0 && flotante2 <= 7){
        if(externalUse === false){
          if(pieza.colour === true){
              setCastleShort(false) 
              setCastleLong(false)
          } else{
              setCastleShortBlack(false) 
              setCastleLongBlack(false)
          }
        }
        return true
      } else if(flotante <= 7 && flotante2 === 0){
        if(externalUse === false){
          if(pieza.colour === true){
              setCastleShort(false) 
              setCastleLong(false)
          } else{
              setCastleShortBlack(false)
              setCastleLongBlack(false)
          }
        }
        return true
      } else if(flotante === 0 && flotante2 >= -7){
        if(externalUse === false){
          if(pieza.colour === true){
              setCastleShort(false) 
              setCastleLong(false)
          } else{
              setCastleShortBlack(false) 
              setCastleLongBlack(false)
          }
        }
        return true
      } else if(flotante >= -7 && flotante2 === 0){
        if(externalUse === false){
          if(pieza.colour === true){
              setCastleShort(false) 
              setCastleLong(false)
          } else{
              setCastleShortBlack(false)
              setCastleLongBlack(false)
          }
        }
        return true
      } else {
        return false
      }
    } else if(pieza.name === "Bishop"){
      for(let i = 1; i < 8; i++){
        if(flotante === i && flotante2 === i){
          return true
        } else if(flotante === -i && flotante2 === i){
          return true
        } else if(flotante === i && flotante2 === -i){
          return true
        } else if(flotante === -i && flotante2 === -i){
          return true
        }
      }
      return false
    } else if(pieza.name === "Queen"){
      for(let i = 1; i < 8; i++){
        if(flotante === i && flotante2 === i){
          return true
        } else if(flotante === -i && flotante2 === i){
          return true
        } else if(flotante === i && flotante2 === -i){
          return true
        } else if(flotante === -i && flotante2 === -i){
          return true
        }
      }
      if(flotante === 0 && flotante2 <= 7){
        return true
      } else if(flotante <= 7 && flotante2 === 0){
        return true
      } else if(flotante === 0 && flotante2 >= -7){
        return true
      } else if(flotante >= -7 && flotante2 === 0){
        return true
      } else {
        return false
      } 
    } else if(pieza.name === "King"){
      if(flotante < 2 && flotante2 < 2 && flotante > -2 && flotante2 > -2){
        if(externalUse === false){
          if(pieza.colour === true){
              setCastleShort(false) 
              setCastleLong(false)
          } else{
              setCastleShortBlack(false) 
              setCastleLongBlack(false)
          }
        }
        return true
      } else if(castleShort === true && flotante2 === 2 && flotante === 0 || castleShortBlack === true && flotante2 === 2 && flotante === 0){
        if(externalUse === false){
          return "castleShort"
        }
        return true
      } else if(castleLong === true && flotante2 === -2 && flotante === 0 || castleLongBlack === true && flotante2 === -2 && flotante === 0){
        if(externalUse === false){
          return "castleLong"
        }
        return true
      } else {
        return false
      }
    } else if(pieza.name === "Knight"){
      if(flotante === 2 && flotante2 === 1){
        return true
      } else if(flotante === 2 && flotante2 === -1){
        return true
      } else if(flotante === 1 && flotante2 === 2){
        return true
      } else if(flotante === -1 && flotante2 === 2){
        return true
      } else if(flotante === -2 && flotante2 === 1){
        return true
      } else if(flotante === -2 && flotante2 === -1){
        return true
      } else if(flotante == -1 && flotante2 === -2){
        return true
      } else if(flotante === 1 && flotante2 === -2){
        return true
      } else{
        return false
      }
    }
  }

  function checkMidPieces(pieza, initialSquare, finalSquare){
    let chequeoX = finalSquare[0] - initialSquare[0];
    let chequeoY = finalSquare[1] - initialSquare[1];
    for(let i = 0; i < Board.length; i++){


      if(pieza.name === "Knight"){
        return true
      }
      if(chequeoX < 0 && chequeoY > 0){

        let flotante = Board[i].id[0] - initialSquare[0];
        let flotante2 = Board[i].id[1]  - initialSquare[1];

        if(Board[i].id !== finalSquare 
          && pieceMovements(pieza, initialSquare, Board[i].id, true) === true 
          && flotante < 0 && flotante2 > 0 
          && Board[i].piece.length === 1 
          && chequeoX < flotante && chequeoY > flotante2){
          return false
        }
      }else if(chequeoX > 0 && chequeoY > 0){

        let flotante = Board[i].id[0] - initialSquare[0];
        let flotante2 = Board[i].id[1]  - initialSquare[1];

        if(Board[i].id !== finalSquare 
          && pieceMovements(pieza, initialSquare, Board[i].id, true) === true 
          && flotante > 0 && flotante2 > 0 
          && Board[i].piece.length === 1
          && chequeoX > flotante && chequeoY > flotante2){
          return false
        }
      }else if(chequeoX < 0 && chequeoY < 0){

        let flotante = Board[i].id[0] - initialSquare[0];
        let flotante2 = Board[i].id[1]  - initialSquare[1];

        if(Board[i].id !== finalSquare 
          && pieceMovements(pieza, initialSquare, Board[i].id, true) === true 
          && flotante < 0 && flotante2 < 0 
          && Board[i].piece.length === 1
          && chequeoX < flotante && chequeoY < flotante2){
          return false
        }
      } else if(chequeoX > 0 && chequeoY < 0){

        let flotante = Board[i].id[0] - initialSquare[0];
        let flotante2 = Board[i].id[1]  - initialSquare[1];

        if(Board[i].id !== finalSquare 
          && pieceMovements(pieza, initialSquare, Board[i].id, true) === true 
          && flotante > 0 && flotante2 < 0 
          && Board[i].piece.length === 1
          && chequeoX > flotante && chequeoY < flotante2){
          return false
        }
      } else if(chequeoX === 0 && chequeoY < 0){

        let flotante = Board[i].id[0] - initialSquare[0];
        let flotante2 = Board[i].id[1]  - initialSquare[1];

        if(Board[i].id !== finalSquare
          && pieceMovements(pieza, initialSquare, Board[i].id, true) === true 
          && flotante === 0 && flotante2 < 0 
          && Board[i].piece.length === 1
          && chequeoY < flotante2){
          return false
        }
    } else if(chequeoX === 0 && chequeoY > 0){

      let flotante = Board[i].id[0] - initialSquare[0];
      let flotante2 = Board[i].id[1]  - initialSquare[1];

      if(Board[i].id !== finalSquare 
        && pieceMovements(pieza, initialSquare, Board[i].id, true) === true 
        && flotante === 0 && flotante2 > 0 
        && Board[i].piece.length === 1
        && chequeoY > flotante2){
        return false
      }
    } else if(chequeoX < 0 && chequeoY === 0){

      let flotante = Board[i].id[0] - initialSquare[0];
      let flotante2 = Board[i].id[1]  - initialSquare[1];

      if(Board[i].id !== finalSquare 
        && pieceMovements(pieza, initialSquare, Board[i].id, true) === true 
        && flotante < 0 && flotante2 === 0 
        && Board[i].piece.length === 1
        && chequeoX < flotante){
        return false
      }
    } else if(chequeoX > 0 && chequeoY === 0){

      let flotante = Board[i].id[0] - initialSquare[0];
      let flotante2 = Board[i].id[1]  - initialSquare[1];

      if(Board[i].id !== finalSquare 
        && pieceMovements(pieza, initialSquare, Board[i].id, true) === true 
        && flotante > 0 && flotante2 === 0 
        && Board[i].piece.length === 1
        && chequeoX > flotante){
        return false
      }
    }
    }
    return true
  }

  function alPaso(){
    contadoraso++
    if(contadoraso === 1){
      contadorAlPaso++
      alPasoide = true
    }
  }

  function alPasoFalse(){
    for(let i = 0;  i < Board.length; i++){
      if(Board[i].length != 0 && Board[i].piece.length != 0){
        Board[i].piece[0].enPassant = false
      }
    }
  }

  function check(kingSquare, boardCopiado){
    for(let i = 0; i < boardCopiado.length; i++){
      if(boardCopiado[i].piece.length != 0 &&
      kingSquare.piece[0].colour !== boardCopiado[i].piece[0].colour &&
      pieceMovements(boardCopiado[i].piece[0], boardCopiado[i].id, kingSquare.id, true) === true && 
      checkMidPieces(boardCopiado[i].piece[0], boardCopiado[i].id, kingSquare.id) === true){
        Board[60].id = "85"
        Board[4].id = "15"
        return true
      } 
    }
    Board[60].id = "85"
    Board[4].id = "15"
    return false
  }

  function staleMate(){
    let tablasBlanco = false
    let tablasNegro = false
    for(let i = 0; i < Board.length; i++){
      if(Board[i].piece.colour ===  true){     
        for(let j =0; j < Board.length; j++){
          if(pieceMovements(Board[i].piece[0], Board[i].id, Board[j].id,  true) === true && 
            checkMidPieces(Board[i].piece[0], Board[i].id, Board[j].id) === true){
            tablasBlanco = true
          }
        }
      } else if(Board[i].piece.colour ===  false){
        for(let j =0; j < Board.length; j++){
          if(pieceMovements(Board[i].piece[0], Board[i].id, Board[j].id,  true) === true && 
            checkMidPieces(Board[i].piece[0], Board[i].id, Board[j].id) === true){
            tablasNegro = true
          }
        }
      }
    }
    if(tablasBlanco === false || tablasNegro === false){
      return true
    } else{
      return false
    }
  }
  

  return(
    <div>

      <WhiteBoard array={Board} funcion={((e) => (movePiece(e)))}/>
            
  </div>
  );
}

/*<button onClick={handleClick}>toca aca boludo</button>

<button onClick={() => socket.emit('joinRoom', {room: "FerroPasion"})}>conectate simio</button>

<input onChange={handleInput}></input>

<button onClick={handleClickRoom}>toca aca boludo</button>

const {socket, isConnected} = useSocket()

const [message, setMessage] = useState()

useEffect(()  => {
  if(!socket) return;

  socket.on('pingAll', (data) => {console.log("recibido ", data)})

  socket.on('newMessage', (data) => {console.log("recibido de la sala", data)})

}, [socket, isConnected])

  function handleClick(){
  socket.emit('pingAll', {message: "me encantan las kinesiologas"})
}

function handleClickRoom(){
  socket.emit('sendMessage', {message: message})
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min) + min);
};

function movePiece(e){
    console.log(turnoDe,"<--Turnode ----- color->",colorMio)
    console.log(seleccion)
    if(turnoDe==colorMio){
      if(seleccion === false){
        for(let i = 0; i < Board.length; i++){
          if(Board[i].id === e.target.id && Board[i].piece.length === 1){
            setPiezaSeleccionada(Board[i].piece[0])
            setSquarePiezaSeleccionada(Board[i].id)
            setSeleccion(true)
          }
        }
      }else if(seleccion === true){
        for(let i = 0; i < Board.length; i++){
          
          console.log(turno)
  
          if (Board[i].piece.length != 0) {
            console.log(Board[i].piece[0].colour)        
  
            if(Board[i].id === e.target.id && Board[i].piece[0].colour !== piezaSeleccionada.colour && 
            pieceMovements(piezaSeleccionada, squarePiezaSeleccionada, e.target.id) === true && 
            checkMidPieces(piezaSeleccionada, squarePiezaSeleccionada, e.target.id) === true &&
            piezaSeleccionada.colour === turno){
              for(let j = 0; j < Board.length; j++){
                if(Board[j].id === squarePiezaSeleccionada){
                  Board[j].piece.pop()
                  Board[i].piece.pop()
                }
              }
              Board[i].piece.push(piezaSeleccionada)
              if(turno === true){
                setTurno(false)
              } else{
                setTurno(true)
              }
              console.log(Board)
            }
          } else {
            console.log(Board[i].piece.colour)  
            if(Board[i].id === e.target.id && 
            pieceMovements(piezaSeleccionada, squarePiezaSeleccionada, e.target.id) === true && 
            checkMidPieces(piezaSeleccionada, squarePiezaSeleccionada, e.target.id) === true &&
            piezaSeleccionada.colour === turno){
              for(let j = 0; j < Board.length; j++){
                if(Board[j].id === squarePiezaSeleccionada){
                  Board[j].piece.pop()
                  Board[i].piece.pop()
                }
              }
              Board[i].piece.push(piezaSeleccionada)
              if(turno === true){
                setTurno(false)
              } else{
                setTurno(true)
              }
              console.log(Board)
            }
          }
        }
      if (socket) {
        socket.emit('hacerMovimiento', { Board });
      } 
    }
    
  }
  }

*/