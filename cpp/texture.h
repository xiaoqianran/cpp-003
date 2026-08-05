// 纹理：常量 / 棋盘 / 程序化图像（双线性）
#pragma once

#include "rt_common.h"
#include "vec3.h"
#include <vector>

class texture {
public:
  virtual ~texture() = default;
  virtual color value(double u, double v, const point3 &p) const = 0;
};

class solid_color : public texture {
public:
  solid_color(const color &c) : color_value(c) {}
  solid_color(double r, double g, double b) : color_value(r, g, b) {}
  color value(double, double, const point3 &) const override { return color_value; }

private:
  color color_value;
};

class checker_texture : public texture {
public:
  checker_texture(double scale, shared_ptr<texture> even, shared_ptr<texture> odd)
      : inv_scale(1.0 / scale), even(even), odd(odd) {}
  checker_texture(double scale, const color &c1, const color &c2)
      : checker_texture(scale, make_shared<solid_color>(c1), make_shared<solid_color>(c2)) {}

  color value(double u, double v, const point3 &p) const override {
    auto x = static_cast<int>(std::floor(inv_scale * p.x()));
    auto y = static_cast<int>(std::floor(inv_scale * p.y()));
    auto z = static_cast<int>(std::floor(inv_scale * p.z()));
    bool is_even = (x + y + z) % 2 == 0;
    return is_even ? even->value(u, v, p) : odd->value(u, v, p);
  }

private:
  double inv_scale;
  shared_ptr<texture> even;
  shared_ptr<texture> odd;
};

class uv_checker_texture : public texture {
public:
  uv_checker_texture(double scale, const color &c1, const color &c2)
      : scale(scale), odd(c1), even(c2) {}

  color value(double u, double v, const point3 &) const override {
    auto s = static_cast<int>(std::floor(u * scale));
    auto t = static_cast<int>(std::floor(v * scale));
    return ((s + t) % 2 == 0) ? even : odd;
  }

private:
  double scale;
  color odd, even;
};

class image_texture : public texture {
public:
  image_texture(int w, int h, std::vector<unsigned char> rgb, bool bilinear = true)
      : width(w), height(h), data(std::move(rgb)), bilinear(bilinear) {}

  static shared_ptr<image_texture> make_demo(int w = 64, int h = 64, bool bilinear = true) {
    std::vector<unsigned char> rgb(static_cast<size_t>(w * h * 3));
    for (int y = 0; y < h; ++y) {
      for (int x = 0; x < w; ++x) {
        size_t i = static_cast<size_t>((y * w + x) * 3);
        double fx = double(x) / w;
        double fy = double(y) / h;
        bool cell = ((x / 8) + (y / 8)) % 2 == 0;
        rgb[i + 0] = static_cast<unsigned char>(cell ? 220 : 40 + 180 * fx);
        rgb[i + 1] = static_cast<unsigned char>(cell ? 80 + 140 * fy : 160);
        rgb[i + 2] = static_cast<unsigned char>(cell ? 60 : 200);
      }
    }
    return make_shared<image_texture>(w, h, std::move(rgb), bilinear);
  }

  /** 木纹程序图（作业房间桌面） */
  static shared_ptr<image_texture> make_wood(int w = 128, int h = 128) {
    std::vector<unsigned char> rgb(static_cast<size_t>(w * h * 3));
    for (int y = 0; y < h; ++y) {
      for (int x = 0; x < w; ++x) {
        double fx = double(x) / w;
        double grain = 0.5 + 0.5 * std::sin(fx * 40.0 + 3.0 * std::sin(double(y) * 0.15));
        double r = 0.35 + 0.35 * grain;
        double g = 0.22 + 0.2 * grain;
        double b = 0.1 + 0.08 * grain;
        size_t i = static_cast<size_t>((y * w + x) * 3);
        rgb[i + 0] = static_cast<unsigned char>(clamp(r, 0.0, 1.0) * 255);
        rgb[i + 1] = static_cast<unsigned char>(clamp(g, 0.0, 1.0) * 255);
        rgb[i + 2] = static_cast<unsigned char>(clamp(b, 0.0, 1.0) * 255);
      }
    }
    return make_shared<image_texture>(w, h, std::move(rgb), true);
  }

  color value(double u, double v, const point3 &) const override {
    if (data.empty()) return color(0, 1, 1);
    u = clamp(u, 0.0, 1.0);
    v = 1.0 - clamp(v, 0.0, 1.0);

    if (!bilinear) {
      auto i = static_cast<int>(u * width);
      auto j = static_cast<int>(v * height);
      if (i >= width) i = width - 1;
      if (j >= height) j = height - 1;
      return pixel(i, j);
    }

    // 双线性
    double x = u * width - 0.5;
    double y = v * height - 0.5;
    int i = static_cast<int>(std::floor(x));
    int j = static_cast<int>(std::floor(y));
    double fx = x - i;
    double fy = y - j;
    auto samp = [&](int ii, int jj) {
      ii = (ii % width + width) % width;
      jj = clamp(jj, 0, height - 1);
      return pixel(ii, jj);
    };
    color c00 = samp(i, j);
    color c10 = samp(i + 1, j);
    color c01 = samp(i, j + 1);
    color c11 = samp(i + 1, j + 1);
    return (1 - fx) * (1 - fy) * c00 + fx * (1 - fy) * c10 + (1 - fx) * fy * c01 + fx * fy * c11;
  }

private:
  int width, height;
  std::vector<unsigned char> data;
  bool bilinear;

  color pixel(int i, int j) const {
    const double s = 1.0 / 255.0;
    size_t idx = static_cast<size_t>(3 * i + 3 * width * j);
    return color(s * data[idx], s * data[idx + 1], s * data[idx + 2]);
  }
};
