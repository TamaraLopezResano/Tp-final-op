# Proyecto Ajedrez

### Hecho por

- Fabricio Domeniconi Caamaño
- Tamara Lopez Resano
- Franco Prestia
- Lucas Agustin Silveira

## ¿De que trata este proyecto?

El proyecto de ajedrez trata de, como dice el título, recrear una partida de ajedrez, sabiendo de que no tendrás un límite de tiempo para pensar, en otras palabras, tenes tiempo ilimitado. 

## Procedimiento y desarrollo

- Discusion de la idea
- Creacion del boceto
- Implementacion del html/css
- Implementacion de funcionalidades y logica

## Como jugar al ajedrez
 
Para jugar se requiere de dos personas que disponeran de 16 piezas en un tablero de 64 casillas (32 ocupadas por piezas) que son: 

- Dos torres que se moveran de manera vertical y horizontal.
- Dos alfiles que se moveran de manera diagonal.
- Dos caballos que se moveran en forma de L.
- Una reina que se movera de manera vertical, horizontal o diagonal por todo el tablero.
- Un rey que se movera de manera vertical, horizontal o diagonal pero solo una casilla.

Ambos se turnaran, sabiendo que en cualquier partida las blancas moveran primero, para poder intentar comer las piezas del rival sin que este les coma las suyas. Ganara el que logre hacer jaque-mate al rey, para esto debes amenazar al rey y que no pueda moverse a ninguna casilla ni que pueda ser protejido por una pieza suya. 


![](/imagenes/tablero.jpg)


### Lista de movimientos especiales

Los movimientos especiales, que suelen estar en el juego pero no son tan usados por gente que recien arranca a jugar, son:

- Enroque: Consiste en que el rey y la torre puedan intercambiar de posiciones haciendo que el rey pase a estar del medio a cerca de una esquina del tablero.


![](/imagenes/enroque.jpg)

- Captura al paso: Consiste en capturar un peon que tengas a la izquierda o la derecha y que haya decido hacer que su movimiento inicial sea avanzardos casillas.


![](/imagenes/captura.jpg)

 
- Coronacion: Consiste en que un peon llegue al final del tablero, ahi podra transformar su peon en una reina.


![](/imagenes/promocionar.jpg)


## Base de datos

No existe una base de datos, los valores se definieron en componentes para definir las piezas y un componente para el tablero. 

## Uso del usesocket

Para este proyecto, se usa un socket para que se puedan jugar desde distintas computadoras, como si fuera una partida a distancia. Esto se pudo hacer mediante turnos, donde el jugador tenga que esperar al que el otro envie su movimiento para poder juagar.
