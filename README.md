# Tetris Web

Un juego clásico de Tetris implementado para navegadores web utilizando HTML5, CSS3 y JavaScript puro.

![Tetris Screenshot](https://via.placeholder.com/600x400?text=Tetris+Game)

## Características

- Interfaz de usuario moderna y atractiva
- Puntuación progresiva
- Sistema de niveles (aumenta la dificultad con el tiempo)
- Visualización de la siguiente pieza
- Controles intuitivos
- Adaptado para dispositivos móviles

## Cómo jugar

1. Abre el archivo `index.html` en tu navegador web
2. Haz clic en "Iniciar Juego" para comenzar
3. Utiliza las teclas de dirección para controlar las piezas:
   - ⬅️ ➡️: Mover la pieza a la izquierda o derecha
   - ⬆️: Rotar la pieza
   - ⬇️: Acelerar la caída de la pieza
   - Espacio: Caída instantánea
   - P: Pausar/Reanudar el juego

## Reglas del juego

- Las piezas caen desde la parte superior del tablero
- El jugador debe rotar y mover las piezas para formar líneas horizontales completas
- Cuando se completa una línea, esta desaparece y todas las piezas por encima descienden
- La puntuación aumenta al completar líneas
- El nivel aumenta cada 10 líneas completadas, aumentando la velocidad de caída
- El juego termina cuando las piezas llegan a la parte superior del tablero

## Requisitos técnicos

- Navegador web moderno con soporte para HTML5 y JavaScript
- No se requieren bibliotecas o frameworks adicionales

## Desarrollo

Este proyecto utiliza exclusivamente tecnologías web estándar:

- HTML5 para la estructura
- CSS3 para los estilos
- JavaScript para la lógica del juego
- Canvas API para el renderizado del juego

## Estructura del proyecto

```
tetris/
├── index.html       # Archivo principal HTML
├── css/
│   └── style.css    # Estilos del juego
├── js/
│   └── tetris.js    # Lógica del juego
└── README.md        # Documentación
```

## Contribuir

Las contribuciones son bienvenidas. Si deseas mejorar este proyecto:

1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Haz commit de tus cambios (`git commit -m 'Añadir nueva característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles. 