# [🎮 Play the Game!](https://maoyeedy.github.io/P5-ShadowGame/)

<!-- ### 🕹️ About the Game -->
A [p5.js](https://p5js.org/) game for a [24-hour gamejam](https://itch.io/jam/equinox-game-jam).

I'm completely new to p5.js and I'm learning as I go.

<!-- It's pretty painful to setup collision without [p5play](https://http://p5play.org/). -->

## 🌞 Gameplay

The game can either be played with one or two players.

<!-- #### 🚧 Mechanics:
- **Black Cube** can only move within the shadows.
- **White Cube** can push blocks but cannot enter the shadows. -->

#### 🎯 Win Condition
<!-- - **Black Cube** must navigate through the shadowed blocks and reach the final target to win. -->
- **Black Cube** reaches the final target.

#### ⌨️ Controls
<!-- - *WASD* moves the **Black Cube**. -->
<!-- - *Arrow keys* moves the **White Cube**. -->
- `W`, `A`, `S`, `D` moves the **Black Cube**.
- `↑`, `←`, `↓`, `→` moves the **White Cube**.
- `Q`, `E` rotates the sun.

#### 🛠️ Extra Utilities
- Drag and scroll with your mouse
- `O` to switch orthographic/perspective view
- `R` to restart

## 💡Inspirations

- [Felix the Reaper](https://store.steampowered.com/app/919410/Felix_The_Reaper/), where sun can rotate for 90 degrees.
- [Shadow Puppy Shenanigans](https://prabby-patty.itch.io/shadow-puppy-shenanigans), where blocks' shadow can do something.

<!-- ### Notes -->
<!-- I made a bug, which lead to player1 not able to push blocks, but turns out it works better. So now, player1 can only walk in shadow, and player2 can only push blocks. -->

## 📝 To-Do
- [ ] Make collision affect the other player
- [ ] Add sun rotation check, just like Felix the Reaper
- [ ] Add mobile controls