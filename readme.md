    04p'V(2V) 4yS1+2/ @

Bored of Shadertoy? Now you can program shaders in Webfunge!

That line is equivalent to the Shadertoy template:

    void main(void)
    {
        vec2 uv = gl_FragCoord.xy / iResolution.xy;
        gl_FragColor = vec4(uv, 0.5+0.5*sin(iGlobalTime), 1.0);
    }

but in Webfunge, which is 20% cooler.

--------------------------------------------------------------------------------

Webfunge is a visual stack-based language to inefficiently program shaders.

It is based on Befunge 98 but is not fully compliant with it.
See http://quadium.net/funge/spec98.html for the original specs.

It is also inspired from Lua, another stack-based language.

Features
--------

Executes the program for each pixel of the canvas

Extensive stack manipulation operations (including vector manipulation)

Control flow instructions (tests, jumps)

Debugging instructions

Main differences with Befunge
-----------------------------

Here are the main differences with Befunge 98.

It is restricted to a 2D hybrid Lahey space (more or less a torus with bounds).

It does not implement concurrency, stack stack.

It does not allow changing the space (p and s instructions have been replaced).

Authors
-------

Bloutiouf / tmp

with participation of evO and wsmind

Licensed under MIT License.
