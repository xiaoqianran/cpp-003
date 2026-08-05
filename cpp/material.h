// 材质：支持纹理朗伯 + 金属 / 介质 / 发光
#pragma once

#include "hittable.h"
#include "onb.h"
#include "rt_common.h"
#include "texture.h"
#include "vec3.h"

class material {
public:
  virtual ~material() = default;

  virtual bool scatter(const ray &r_in, const hit_record &rec, color &attenuation,
                       ray &scattered) const {
    (void)r_in;
    (void)rec;
    (void)attenuation;
    (void)scattered;
    return false;
  }

  virtual color emitted(const hit_record &rec) const {
    (void)rec;
    return color(0, 0, 0);
  }

  virtual bool is_lambertian() const { return false; }

  virtual color brdf_lambert(const hit_record &rec) const {
    (void)rec;
    return color(0, 0, 0);
  }

  virtual double scattering_pdf(const ray &, const hit_record &, const ray &) const {
    return -1.0;
  }
};

class lambertian : public material {
public:
  lambertian(const color &albedo) : tex(make_shared<solid_color>(albedo)) {}
  lambertian(shared_ptr<texture> t) : tex(t) {}

  bool scatter(const ray &, const hit_record &rec, color &attenuation,
               ray &scattered) const override {
    onb uvw;
    uvw.build_from_w(rec.normal);
    auto scatter_direction = uvw.local(random_cosine_direction());
    scattered = ray(rec.p, unit_vector(scatter_direction));
    attenuation = tex->value(rec.u, rec.v, rec.p);
    return true;
  }

  bool is_lambertian() const override { return true; }

  color brdf_lambert(const hit_record &rec) const override {
    return tex->value(rec.u, rec.v, rec.p) / pi;
  }

  double scattering_pdf(const ray &, const hit_record &rec, const ray &scattered) const override {
    auto cos_theta = dot(rec.normal, unit_vector(scattered.direction()));
    return cos_theta < 0 ? 0 : cos_theta / pi;
  }

private:
  shared_ptr<texture> tex;
};

class metal : public material {
public:
  metal(const color &albedo, double fuzz) : albedo(albedo), fuzz(fuzz < 1 ? fuzz : 1) {}

  bool scatter(const ray &r_in, const hit_record &rec, color &attenuation,
               ray &scattered) const override {
    vec3 reflected = reflect(unit_vector(r_in.direction()), rec.normal);
    scattered = ray(rec.p, reflected + fuzz * random_unit_vector());
    attenuation = albedo;
    return (dot(scattered.direction(), rec.normal) > 0);
  }

private:
  color albedo;
  double fuzz;
};

class dielectric : public material {
public:
  dielectric(double refraction_index) : refraction_index(refraction_index) {}

  bool scatter(const ray &r_in, const hit_record &rec, color &attenuation,
               ray &scattered) const override {
    attenuation = color(1.0, 1.0, 1.0);
    double ri = rec.front_face ? (1.0 / refraction_index) : refraction_index;
    vec3 unit_direction = unit_vector(r_in.direction());
    double cos_theta = std::fmin(dot(-unit_direction, rec.normal), 1.0);
    double sin_theta = std::sqrt(1.0 - cos_theta * cos_theta);
    bool cannot_refract = ri * sin_theta > 1.0;
    vec3 direction;
    if (cannot_refract || reflectance(cos_theta, ri) > random_double())
      direction = reflect(unit_direction, rec.normal);
    else
      direction = refract(unit_direction, rec.normal, ri);
    scattered = ray(rec.p, direction);
    return true;
  }

private:
  double refraction_index;
  static double reflectance(double cosine, double refraction_index) {
    auto r0 = (1 - refraction_index) / (1 + refraction_index);
    r0 = r0 * r0;
    return r0 + (1 - r0) * std::pow((1 - cosine), 5);
  }
};

class diffuse_light : public material {
public:
  diffuse_light(const color &emit) : emit(emit) {}
  diffuse_light(shared_ptr<texture> t) : emit_tex(t) {}

  color emitted(const hit_record &rec) const override {
    if (emit_tex) return emit_tex->value(rec.u, rec.v, rec.p);
    return emit;
  }

private:
  color emit = color(0, 0, 0);
  shared_ptr<texture> emit_tex;
};
