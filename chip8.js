/*
    Specification
 
    - Memory: 4 KB
    - Display: 64 x 32 pixels monochrome
    - A program counter, PC
    - One 16-bit index register called I
    - A stack for 16-bit addresses
    - An 8-bit delay timer which is decremented at a rate of 60 Hz
    - An 8-bit sound timer which functions like the delay timer, but gives off a beeping sound as long as its not zero
    - 16 8-bit general-purpose variable registers

    fetch-decode-execute cycle
    An instruction is 2 bytes
*/

const MEMORY_LIMIT = 4096
const SCREEN_WIDTH = 640
const SCREEN_HEIGHT = 320
const FONT_ADDRESS_START = 0x50
let memory = new Array(MEMORY_LIMIT)
let stack = []
let display = []
let program = null
let hasPressedKey = false
let pressedKeyCode

const keys = {
    0x0: 88,
    0x1: 49,
    0x2: 50,
    0x3: 51,
    0x4: 81,
    0x5: 87,
    0x6: 69,
    0x7: 65,
    0x8: 83,
    0x9: 68,
    0xA: 90,
    0xB: 67,
    0xC: 52,
    0xD: 82,
    0xE: 70,
    0xF: 86
}

let key_pressed = {}

// Program counter and index register
let PC, I

// V0, V1, V2, V3, V4, V5, V6, V7, V8, V9, VA, VB, VC, VD, VE, VF
let V = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

let delayTimer = 0
let soundTimer = 0

// Set fonts
memory[FONT_ADDRESS_START + 0 ] = 0xF0, memory[0x51] = 0x90, memory[0x52] = 0x90, memory[0x53] = 0x90, memory[0x54] = 0xF0 // 0
memory[FONT_ADDRESS_START + 5 ] = 0x20, memory[0x56] = 0x60, memory[0x57] = 0x20, memory[0x58] = 0x20, memory[0x59] = 0x70 // 1 
memory[FONT_ADDRESS_START + 10] = 0xF0, memory[0x61] = 0x10, memory[0x62] = 0xF0, memory[0x63] = 0x80, memory[0x64] = 0xF0 // 2
memory[FONT_ADDRESS_START + 15] = 0xF0, memory[0x66] = 0x10, memory[0x67] = 0xF0, memory[0x68] = 0x10, memory[0x69] = 0xF0 // 3
memory[FONT_ADDRESS_START + 20] = 0x90, memory[0x71] = 0x90, memory[0x72] = 0xF0, memory[0x73] = 0x10, memory[0x74] = 0x10 // 4
memory[FONT_ADDRESS_START + 25] = 0xF0, memory[0x76] = 0x80, memory[0x77] = 0xF0, memory[0x78] = 0x10, memory[0x79] = 0xF0 // 5
memory[FONT_ADDRESS_START + 30] = 0xF0, memory[0x81] = 0x80, memory[0x82] = 0xF0, memory[0x83] = 0x90, memory[0x84] = 0xF0 // 6
memory[FONT_ADDRESS_START + 35] = 0xF0, memory[0x86] = 0x10, memory[0x87] = 0x20, memory[0x88] = 0x40, memory[0x89] = 0x40 // 7
memory[FONT_ADDRESS_START + 40] = 0xF0, memory[0x91] = 0x90, memory[0x92] = 0xF0, memory[0x93] = 0x90, memory[0x94] = 0xF0 // 8
memory[FONT_ADDRESS_START + 45] = 0xF0, memory[0x96] = 0x90, memory[0x97] = 0xF0, memory[0x98] = 0x10, memory[0x99] = 0xF0 // 9

function clearScreen() {
    for (let y = 0; y < SCREEN_HEIGHT / 10; y++){
        for (let x = 0; x < SCREEN_WIDTH / 10; x++)
            display[y][x] = 0
    }
}

function displayScreen() {
    for (let y = 0; y < SCREEN_HEIGHT / 10; y++)
        for (let x = 0; x < SCREEN_WIDTH / 10; x++) {
            if (display[y][x] == 0){
                fill(0)
                rect(x*10, y*10, 10, 10)
            } else {
                fill(255)
                rect(x*10, y*10, 10, 10)
            }
                
        }
}

function setup() {
    let canvas = createCanvas(640, 320)
    canvas.parent("screen")

    let input = createFileInput((file) => {
        print(typeof(file))
        // console.log(file)
        print(file)
        print(file.type)

        let reader = new FileReader();

        reader.onload = function(e) {
            // binary data
            program = new Uint8Array(e.target.result)
            draw()
        }

        reader.onerror = function(e) {
            // error occurred
            console.log('Error : ' + e.type)
        }
        reader.readAsArrayBuffer(file.file)
    })
    
    input.parent("under")

    // Initialize the screen values
    for (let y = 0; y < SCREEN_HEIGHT / 10; y++){
        display[y] = new Array(SCREEN_WIDTH / 10)
        for (let x = 0; x < SCREEN_WIDTH / 10; x++)
            display[y][x] = 0
    }
    clearScreen()
    displayScreen()
}

function draw() {

    if (program) {
        noStroke()
        clearScreen()
        displayScreen()
        loadProgram(program)
        emulate()
        startDelayTimer()
        startSoundTimer()
        noLoop()
    }
    
}


function keyPressed() {
    for (let k = 0x0; k <= 0xF; k++) {
        if (keys[k] == keyCode) {
            key_pressed[k] = true
        }
    }
}

function keyReleased() {
    for (let k = 0x0; k <= 0xF; k++) {
        if (keys[k] == keyCode) {
            key_pressed[k] = false
        }
    }
}


function startSoundTimer() {
    setInterval(() => {
        if (soundTimer > 0) 
            soundTimer--
    }, 1000/ 60)
}

function startDelayTimer() {
    setInterval(() => {
        if (delayTimer > 0) 
            delayTimer--
    }, 1000/ 60)
}

function loadProgram(program) {
    PC = 0x200
    for (let i = PC; i < PC + program.byteLength; i++) {
        memory[i] = program[i-PC]
    }
}

function emulate() {
    let intervalId

    function invalidInstruction(id) {
        console.log("Instruction not identified")
        clearInterval(id)
    }

    intervalId = setInterval(() => {
        // Run the fetch-decode-execute cycle at 700 instructions per second
        console.log("PC is at = ", PC)
        // Fetch
        let instruction = (memory[PC] << 8) | memory[PC+1]
        PC += 2

        const kind = (instruction >> 12) & 0xf // kind of instruction
        const X = (instruction >> 8) & 0xf // V0 - VF
        const Y = (instruction >> 4) & 0xf // V0 - VF
        const N = instruction & 0x000f // 4-bit number
        const NN = instruction & 0x00ff // 8-bit immediate number
        const NNN = instruction & 0x0fff // 12-bit immediate memory address

        console.log("Current instruction", instruction.toString(16))
        console.log("Kind = ", kind.toString(16))

        // Decode and Execute
        switch (kind) {
            case 0x0: {
                switch (NN) {
                    case 0xE0: {
                        clearScreen()
                        break
                    }

                    case 0xEE: {
                        let ret = stack.pop()
                        if (ret == undefined) {
                            console.log("Stack underflow")
                            clearInterval(intervalId)
                        }
                        PC = ret
                        break
                    }
                }
                break
            }

            case 0x1: {
                // Jump instruction
                PC = NNN
                break
            }

            case 0x2: {
                stack.push(PC)
                PC = NNN
                break
            }

            case 0x3: {
                if (V[X] === NN)
                    PC += 2
                break
            }

            case 0x4: {
                if (V[X] !== NN) 
                    PC += 2
                break
            }

            case 0x5: {
                if (V[X] === V[Y])
                    PC += 2
                break
            }

            case 0x6: {
                // Set register VX to the value NN
                console.log()
                V[X] = NN
                break
            }

            case 0x7: {
                // Add NN to VX
                V[X] = (V[X] + NN) & 0xff
                break
            }

            case 0x8: {
                
                switch (N) {
                    case 0x0: {
                        V[X] = V[Y] & 0xff
                        V[X] = V[Y]
                        break
                    }
                    
                    case 0x1: {
                        V[X] = V[X] | V[Y]
                        break
                    }

                    case 0x2: {
                        V[X] = V[X] & V[Y]
                        break
                    }

                    case 0x3: {
                        V[X] = V[X] ^ V[Y]
                        break
                    }

                    case 0x4: {
                        V[X] = V[X] + V[Y]

                        // Check for overflow
                        if ((V[X] >> 9) & 1)
                            V[0xF] = 1
                        else
                            V[0xF] = 0

                        V[X] &= 0xff
                        break
                    }

                    case 0x5:
                    case 0x7: {
                        V[0xF] = (V[Y] > V[X]) ? 0 : 1
                        V[X] = (V[X] - V[Y]) & 0xff
                        break
                    }

                    case 0x6: {
                        V[X] >>= 1
                        break
                    }

                    case 0xE: {
                        V[X] = (V[X] << 1) & 0xff
                        break
                    }

                    default: {
                        invalidInstruction(intervalId)
                    }
                }
                break
            }

            case 0x9: {
                switch(N) {
                    case 0x0: {
                        if (V[X] !== V[Y])
                            PC += 2
                        break
                    }

                    default: {
                        invalidInstruction(intervalId)
                    }
                }
                
            }

            case 0xA: {
                // Set index
                I = NNN & 0xfff
                break
            }

            case 0xB: {
                PC = (V[0] + NNN) & 0xfff
                break
            }

            case 0xC: {
                V[X] = Math.floor(Math.random() * 256) & NN
                break
            } 

            case 0xD: {
                let x = V[X] % 64, y = V[Y] % 32
                V[0xF] = 0

                for (let i = 0; i < N; i++) {
                    let spriteData = memory[I+i]

                    for (let j = 7; j >= 0; j--) {
                        if (display[y][x] && (spriteData & (1 << j)) > 0) {
                            display[y][x] = 0
                            V[0xF] = 1
                        } else if (display[y][x] == 0 && (spriteData & (1 << j)) > 0) {
                            display[y][x] = 1
                        }

                        if (x >= 64) break
                        x++
                    }
                    x = V[X] % 64
                    y++
                    if (y >= 32) break
                }
                displayScreen()
                break
            }

            case 0xE: {
                switch (NN) {
                    case 0x9E: {
                        console.log("Waiting for keypress")
                        // clearInterval(intervalId)
                        if (key_pressed[V[X]]) {
                            PC += 2
                        }
                        break
                        // let pollingId = setInterval(() => {
                        //     if (hasPressedKey) {
                        //         if (hasPressedKey && pressedKeyCode == V[X])
                        //             PC += 2
                        //         hasPressedKey = false
                        //         clearInterval(pollingId)
                        //         emulate()
                        //     }
                        // }, 100)
                    }

                    case 0xA1: {
                        console.log("Waiting for keypress")
                        if (!key_pressed[V[X]]) {
                            PC += 2
                        }
                        break
                    }

                    default: {
                        invalidInstruction(intervalId)
                        break
                    }
                }
                break
            }

            case 0xF: {
                switch(NN) {
                    case 0x07: {
                        V[X] = delayTimer
                        break
                    }

                    case 0x0A: {
                        console.log("Waiting for key press")
                        clearInterval(intervalId)
                        
                        let pollingId = setInterval(() => {
                            console.log("Polling for keypress event")

                            for (let k = 0x0; k <= 0xF; k++) {
                                if (key_pressed[k] == true) {
                                    V[X] = k
                                    clearInterval(pollingId)
                                    emulate()
                                }
                            }
                        }, 1000/60)
                           
                    }

                    case 0x15: {
                        delayTimer = V[X]
                        break
                    }

                    case 0x18: {
                        soundTimer = V[X]
                        break
                    }

                    case 0x1E: {
                        I = (I + V[X]) & 0xfff
                        break
                    }

                    case 0x29: {
                        I = FONT_ADDRESS_START + V[X] * 5
                        break
                    }

                    case 0x33: {
                        memory[I] = (Math.floor(V[X] / 100) % 10) & 0xff
                        memory[I+1] = (Math.floor(V[X] / 10) % 10) & 0xff
                        memory[I+2] = (V[X] % 10) & 0xff
                        break
                    }

                    case 0x55: {
                        for (let i = 0; i <= X; i++) {
                            memory[I+i] = V[i]
                        }
                        break
                    }

                    case 0x65: {
                        for (let i = 0; i <= X; i++) {
                            V[i] = memory[I+i]
                        }
                        break
                    }

                    default: {
                        invalidInstruction(intervalId)
                        break
                    }
                }
                break
            }

            default: {
                invalidInstruction(intervalId)
                break
            }

        }
    }, 1000 / 700 )
}


function displayMemoryState() {
    // To be implemented
}

function displayRegisterState() {
    // To be implemented
}