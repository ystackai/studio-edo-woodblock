precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_origin;
uniform float u_time;
uniform float u_alpha;

void main() {
  vec2 pos = gl_FragCoord.xy;

  float dist = distance(pos, u_origin);

  // Ripple wave - two concentric rings with viscous spread
  float speed = 120.0;
  float radius = u_time * speed;
  float ringWidth = 18.0 + u_time * 25.0;

  // Primary ring
  float distFromRing = abs(dist - radius);
  float ring = smoothstep(ringWidth * 0.5, 0.0, distFromRing);
  ring *= smoothstep(0.0, 4.0, distFromRing);

  // Secondary trailing ring
  float radius2 = radius * 0.6;
  float ring2Width = ringWidth * 0.6;
  float dist2 = abs(dist - radius2);
  float ring2 = smoothstep(ring2Width * 0.5, 0.0, dist2);
  ring2 *= smoothstep(0.0, 3.0, dist2);

  // Inner diffusion ring
  float radius3 = radius * 0.3;
  float innerWidth = ringWidth * 0.4;
  float dist3 = abs(dist - radius3);
  float ring3 = smoothstep(innerWidth * 0.5, 0.0, dist3);
  ring3 *= smoothstep(0.0, 2.5, dist3);

  // Combine with ink-bleed falloff
  float intensity = ring * 0.5 + ring2 * 0.35 + ring3 * 0.25;

  // Ink-bleed colors: low saturation, warm-dusky tones
  vec3 inkColor = vec3(0.42, 0.38, 0.46);
  vec3 bleedColor = vec3(0.35, 0.30, 0.40);

  // Viscous spread - exponential outward darkening
  float spread = exp(-dist * 0.003);
  float viscid = intensity * spread;

  // Angular variation for organic feel (wet ink on paper)
  float angle = atan(pos.y - u_origin.y, pos.x - u_origin.x);
  float variation = 0.9 + 0.1 * sin(angle * 5.0 + u_time * 2.0);

  vec3 finalColor = mix(bleedColor, inkColor, intensity) * variation;
  float finalAlpha = viscid * u_alpha;

  // Inner softness fade
  if (dist < radius * 0.2) {
    float innerFade = dist / (radius * 0.2);
    finalAlpha *= innerFade * 0.3;
  }

  gl_FragColor = vec4(finalColor, finalAlpha);
}
