attribute vec2 position; //point position\n\

void main(void) {
    gl_Position = vec4(position, 0., 1.);
}