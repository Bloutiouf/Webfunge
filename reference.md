Instructions
------------

Value | ASCII | Instruction | Effects
------- | ----- | ----------- | -------
33 | ! | Logical not | `b` > `not b`
34 | " | Toggle stringmode | Pushes cells onto the stack
35 | # | Trampoline | Jumps over next cell
36 | $ | Pop | `a` >
37 | % | Modulo | `a` `b` > `a - b * floor(a/b)`
38 | &amp; | Load from register | `r` > `a`
39 | ' | Fetch next character | > `c` and jump over it
40 | ( | Load semantics | `c` >
41 | ) | Unload semantics | 
42 | * | Multiply | `a` `b` > `a * b`
43 | + | Add | `a` `b` > `a + b`
44 | , | Value output | `a` > displays `a` in console
45 | - | Subtract | `a` `b` > `a - b`
46 | . | Store to register | `a` `r` >
47 | / | Divide | `a` `b` > `a / b`
48-57 | 0-9 | Push number (0 to 9) | > `n`
58 | : | Duplicate | `a` > `a` `a`
59 | ; | Jump over | Nothing executed until next semicolon
60 | < | Go west | `delta` = (`-1`, `0`)
61 | = | Absolute position | `x` `y` >
62 | > | Go east | `delta` = (`1`, `0`)
63 | ? | Go away | Go in a random cardinal direction
64 | @ | Stop | 
65-90 | A-Z | Semantics defined |
91 | [ | Turn left | `delta` = counter-clockwise(`delta`)
92 | \ | Swap | `a` `b` > `b` `a`
93 | ] | Turn right | `delta` = clockwise(`delta`)
94 | ^ | Go north | `delta` = (`0`, `-1`)
95 | _ | West-East | `b` > west if `b` otherwise east
96 | ` | Greater Than | `a` `b` -> `1` if `a` > `b` otherwise `0`
97-102 | a-f | Push number (10 to 15) | -> `n`
103 | g | Get from code space | `x` `y` > `c`
105 | i | Load vector from register | `r` `n` > `a_1` ... `a_n`
106 | j | Jump forward | `n` > go `n` times forward
107 | k | Iterate | `n` > execute next instruction `n` times
108 | l | Line return | 
110 | n | Negation | `a` > `-a`
111 | o | Store vector to register | `a_1` ... `a_n` `r` `n` >
112 | p | Get vector from stack | `i` `n` > `s_i+1` ... `s_i+n`
113 | q | Stack output | Displays the stack in console
114 | r | Reflect | `delta` = `-delta`
115 | s | Replace vector in stack | `s_i+1` ... `s_i+n` `i` `n` >
116 | t | Stack top | > `n` stack size before the instruction
117 | u | Wrap | 
118 | v | Go south | `delta` = (`0`, `1`)
119 | w | Compare | `a` `b` > ] if `a` > `b`, [ if `a` < `b`, otherwise continue forward
120 | x | Absolute delta | `x` `y` > set `delta` = (`x`, `y`)
121 | y | Get from stack | `i` > `s_i`
122 | z | Replace in stack | `s_i` `i` >
123 | { | Jump to subroutine | `x` `y` >
124 | &#124; | North-South | `b` > north if `b` otherwise south
125 | } | Return from subroutine | 

`a` `b` > `a + b` means the instruction pops `b`, pops `a`, and pushes `a + b`.

Index `i` can be negative, meaning counting down from the top of the stack.

Semantics
---------

The semantics *m (common math)* is loaded at beginning.

### m (common math)

ASCII | Instruction | Effects
----- | ----------- | -------
A | Abs | `a` > `abs(a)`
C | Cos | `a` > `cos(a)`
E | Exp | `a` > `exp(a)`
F | Floor | `a` > `floor(a)`
I | Min | `a` `b` > `min(a, b)`
J | Max | `a` `b` > `max(a, b)`
L | Log | `a` > `log(a)`
M | Mix | `a` `b` `t` > `a * (1 - t) + b * t`
P | Pi | > `3.14...`
Q | Sqrt | `a` > `sqrt(a)`
R | Random | > `a` in [0, 1[
S | Sin | `a` > `sin(a)`
W | Power | `a` `e` > `a^e`
  
### M (matrix manipulation)

ASCII | Instruction | Effects
----- | ----------- | -------
M | Multiply | `m_00` ... `m_ij` `i` `j` `k` > `m_00` ... `m_ij`
X | Rotation around X | `rad` `i` > `m_00` ... `m_ii`
Y | Rotation around Y | `rad` `i` > `m_00` ... `m_ii`
Z | Rotation around Z | `rad` `i` > `m_00` ... `m_ii`

### V (vector manipulation)

ASCII | Instruction | Effects
----- | ----------- | -------
A | Add | `a_1` ... `a_n` `b_1` ... `b_n` `n` > `a_1 + b_1` ... `a_n + b_n`
D | Dot | `a_1` ... `a_n` `b_1` ... `b_n` `n` > `dot(a, b)`
I | Min | `a_1` ... `a_n` `b_1` ... `b_n` `n` > `min(a_1, b_1)` ... `min(a_n, b_n)`
J | Max | `a_1` ... `a_n` `b_1` ... `b_n` `n` > `max(a_1, b_1)` ... `max(a_n, b_n)`
K | Scale | `a_1` ... `a_n` `k` `n` > `k * a_1` ... `k * a_n`
L | Length | `a_1` ... `a_n` `n` > `length(a)`
M | Mix | `a_1` ... `a_n` `b_1` ... `b_n` `t` `n` > `mix(a_1, b_1, t)` ... `mix(a_n, b_n, t)`
N | Normalize | `a_1` ... `a_n` `n` > `a_1 / length` ... `a_n / legth`
O | Modulo | `a_1` ... `a_n` `b_1` ... `b_n` `n` > `a_1 % b_1` ... `a_n % b_n`
S | Subtract | `a_1` ... `a_n` `b_1` ... `b_n` `n` > `a_1 - b_1` ... `a_n - b_n`
V | Divide | `a_1` ... `a_n` `b_1` ... `b_n` `n` > `a_1 / b_1` ... `a_n / b_n`
W | Duplicate | `a_1` ... `a_n` `n` > `a_1` ... `a_n` `a_1` ... `a_n`
X | Cross | `a_1` `a_2` `a_3` `b_1` `b_2` `b_3` > `c_1` `c_2` `c_3` only in 3D
Y | Multiply | `a_1` ... `a_n` `b_1` ... `b_n` `n` > `a_1 * b_1` ... `a_n * b_n`

### Candidate

ASCII | Instruction | Effects
----- | ----------- | -------
T | Texture | `u` `v` `i` > `r` `g` `b`

Program
-------

The program starts with following stack:

- 4: `time`
- 3: `height`
- 2: `width`
- 1: `y` in [0, height[
- 0: `x` in [0, width[

x, y, width, and height are in pixels. x goes from left to right and y from top to bottom. The canvas size is smaller than the screen
and depends on the Resolution dropdown and the screen aspect ratio.

time is in seconds.

When the program is done, B, G, and then R is popped off the stack, which means
you have to push R, G, and B before you exit (values in [0, 1]).

Language guide
--------------

### Code space


### Stack
