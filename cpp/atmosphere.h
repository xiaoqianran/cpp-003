// 大气：程序天空 + 均匀体积雾（Beer + 各向同性散射）
#pragma once

#include "rt_common.h"
#include "vec3.h"

struct Atmosphere {
  bool env_sky = false;
  color sky_zenith = color(0.45, 0.65, 1.0);
  color sky_horizon = color(0.85, 0.88, 0.95);
  color sky_ground = color(0.25, 0.22, 0.18);
  vec3 sun_dir = unit_vector(vec3(0.4, 0.7, 0.3));
  color sun_color = color(8, 7.5, 6.5);
  double sun_cos = 0.9992;

  double fog_density = 0;
  color fog_albedo = color(0.9, 0.92, 0.95);

  static Atmosphere none() { return Atmosphere{}; }

  static Atmosphere outdoor_clear() {
    Atmosphere a;
    a.env_sky = true;
    a.fog_density = 0.01;
    a.fog_albedo = color(0.85, 0.88, 0.95);
    a.sun_dir = unit_vector(vec3(0.35, 0.85, 0.25));
    a.sun_color = color(12, 11, 9);
    return a;
  }

  static Atmosphere outdoor_foggy() {
    Atmosphere a;
    a.env_sky = true;
    a.sky_zenith = color(0.55, 0.62, 0.72);
    a.sky_horizon = color(0.78, 0.8, 0.84);
    a.fog_density = 0.045; // 均值自由程 ~22
    a.fog_albedo = color(0.92, 0.92, 0.94);
    a.sun_color = color(5, 4.8, 4.2);
    a.sun_dir = unit_vector(vec3(0.2, 0.55, 0.4));
    return a;
  }

  static Atmosphere room_haze() {
    Atmosphere a;
    a.env_sky = false;
    a.fog_density = 0.03;
    a.fog_albedo = color(0.95, 0.93, 0.9);
    return a;
  }

  color eval_sky(const vec3 &dir) const {
    auto unit = unit_vector(dir);
    double y = unit.y();
    color col;
    if (y < 0) {
      double t = clamp(-y, 0.0, 1.0);
      col = (1 - t) * sky_horizon + t * sky_ground;
    } else {
      double t = y * y * (3 - 2 * y);
      col = (1 - t) * sky_horizon + t * sky_zenith;
    }
    if (dot(unit, sun_dir) > sun_cos) col += sun_color;
    return col;
  }

  double transmittance(double dist) const {
    if (fog_density <= 0 || dist <= 0) return 1.0;
    return std::exp(-fog_density * dist);
  }

  bool sample_scatter(double max_t, double &t_scatter) const {
    if (fog_density <= 1e-8) return false;
    double u = random_double();
    if (u >= 1.0) u = 0.999999;
    t_scatter = -std::log(1.0 - u) / fog_density;
    return t_scatter < max_t;
  }
};

inline Atmosphere atmosphere_for_scene(int scene_id) {
  if (scene_id == 0) return Atmosphere::outdoor_clear();
  if (scene_id == 2) return Atmosphere::room_haze();
  if (scene_id == 3) return Atmosphere::outdoor_foggy();
  if (scene_id == 4) return Atmosphere::outdoor_clear();
  return Atmosphere::none();
}
