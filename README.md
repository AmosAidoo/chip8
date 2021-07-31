# chip8
A CHIP-8 emulator in Javascript and p5.js(a great Javascript canvas library). Because of its simplicity, it is usually recommened as a first emulator one should try before going on to build complicated ones (though it is not necessary). I thought it would be fun so I decided to take on this project. It was cool and I totally enjoyed the process. You can even play pong and tetris on it :relieved: . Try it out.
Visit [https://amosaidoo.com/chip8](https://amosaidoo.com/chip8) to see the emulator in action.

# Opcodes
*CHIP-8 has 35 opcodes, which are all two bytes long and stored big-endian.*
`NNN`: address <br/>
`NN`: 8-bit constant <br/>
`N`: 4-bit constant <br/>
`X` and `Y`: 4-bit register identifier <br/>
`PC` : Program Counter <br/>
`I` : 16bit register (For memory address) (Similar to void pointer) <br/>
`VN`: One of the 16 available variables. N may be 0 to F (hexadecimal)<br/>

Please check the chip-8 [wikipedia page](https://en.wikipedia.org/wiki/CHIP-8) for the meaning of the opcodes.

| Opcode | Implemented        |
|--------|--------------------|
| 0NNN   | :x:                |
| 00E0   | :white_check_mark: |
| 00EE   | :white_check_mark: |
| 1NNN   | :white_check_mark: |
| 2NNN   | :white_check_mark: |
| 3XNN   | :white_check_mark: |
| 4XNN   | :white_check_mark: |
| 5XY0   | :white_check_mark: |
| 6XNN   | :white_check_mark: |
| 7XNN   | :white_check_mark: |
| 8XY0   | :white_check_mark: |
| 8XY1   | :white_check_mark: |
| 8XY2   | :white_check_mark: |
| 8XY3   | :white_check_mark: |
| 8XY4   | :white_check_mark: |
| 8XY5   | :white_check_mark: |
| 8XY6   | :white_check_mark: |
| 8XY7   | :white_check_mark: |
| 8XYE   | :white_check_mark: |
| 9XY0   | :white_check_mark: |
| ANNN   | :white_check_mark: |
| BNNN   | :white_check_mark: |
| CXNN   | :white_check_mark: |
| DXYN   | :white_check_mark: |
| EX9E   | :white_check_mark: |
| EXA1   | :white_check_mark: |
| FX07   | :white_check_mark: |
| FX0A   | :white_check_mark: |
| FX15   | :white_check_mark: |
| FX18   | :white_check_mark: |
| FX1E   | :white_check_mark: |
| FX29   | :white_check_mark: |
| FX33   | :white_check_mark: |
| FX55   | :white_check_mark: |
| FX65   | :white_check_mark: |

## Resourses that helped
1. [Cowgod's Chip-8 Technical Reference](http://devernay.free.fr/hacks/chip8/C8TECH10.HTM)
2. [Guide to making a CHIP-8 emulator](https://tobiasvl.github.io/blog/write-a-chip-8-emulator/)
3. [CHIP-8 Wikipedia](https://en.wikipedia.org/wiki/CHIP-8)
