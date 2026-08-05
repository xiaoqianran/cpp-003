// cpp-003 场景：纹理 · 三角网格 · BVH 压力
#pragma once

#include "hittable.h"
#include "material.h"
#include "mesh.h"
#include "quad.h"
#include "sphere.h"
#include "texture.h"
#include <vector>

// 0 棋盘地面 + 球
// 1 纹理康奈尔 + 网格雕塑
// 2 贴图立方体阵列
// 3 多晶簇 BVH 压力
// 4 经典三球（衔接 002）
inline void build_scene(int scene_id, hittable_list &world,
                        std::vector<shared_ptr<quad>> &lights) {
  world.clear();
  lights.clear();

  if (scene_id == 0) {
    auto checker =
        make_shared<checker_texture>(0.35, color(0.15, 0.15, 0.15), color(0.85, 0.85, 0.85));
    world.add(make_shared<sphere>(point3(0, -1000, 0), 1000, make_shared<lambertian>(checker)));
    world.add(make_shared<sphere>(point3(0, 1, 0), 1.0,
                                  make_shared<lambertian>(image_texture::make_demo(64, 64))));
    world.add(make_shared<sphere>(point3(-2.2, 1, 0), 1.0,
                                  make_shared<metal>(color(0.8, 0.8, 0.9), 0.05)));
    world.add(make_shared<sphere>(point3(2.2, 1, 0), 1.0, make_shared<dielectric>(1.5)));
    return;
  }

  if (scene_id == 1) {
    auto red = make_shared<lambertian>(color(0.65, 0.05, 0.05));
    auto white = make_shared<lambertian>(color(0.73, 0.73, 0.73));
    auto green = make_shared<lambertian>(color(0.12, 0.45, 0.15));
    auto floor_tex = make_shared<lambertian>(
        make_shared<uv_checker_texture>(8, color(0.15, 0.15, 0.18), color(0.75, 0.75, 0.72)));
    auto light = make_shared<diffuse_light>(color(15, 15, 15));

    auto wall_back = make_shared<quad>(point3(-1, 0, -1), vec3(2, 0, 0), vec3(0, 2, 0), white);
    auto wall_left = make_shared<quad>(point3(-1, 0, 1), vec3(0, 0, -2), vec3(0, 2, 0), red);
    auto wall_right = make_shared<quad>(point3(1, 0, -1), vec3(0, 0, 2), vec3(0, 2, 0), green);
    auto wall_floor = make_shared<quad>(point3(-1, 0, 1), vec3(2, 0, 0), vec3(0, 0, -2), floor_tex);
    auto wall_ceil = make_shared<quad>(point3(-1, 2, -1), vec3(2, 0, 0), vec3(0, 0, 2), white);
    auto lamp =
        make_shared<quad>(point3(-0.25, 1.99, -0.25), vec3(0.5, 0, 0), vec3(0, 0, 0.5), light);

    world.add(wall_back);
    world.add(wall_left);
    world.add(wall_right);
    world.add(wall_floor);
    world.add(wall_ceil);
    world.add(lamp);
    lights.push_back(lamp);

    auto crystal =
        make_crystal_mesh(make_shared<lambertian>(image_texture::make_demo(48, 48)),
                          point3(-0.35, 0.45, 0.1), 0.4);
    crystal.append_to(world);

    auto cube = make_cube_mesh(
        make_shared<lambertian>(
            make_shared<uv_checker_texture>(4, color(0.9, 0.7, 0.2), color(0.2, 0.25, 0.5))),
        point3(0.4, 0.3, -0.15), 0.55);
    cube.append_to(world);

    world.add(make_shared<sphere>(point3(0.15, 0.25, 0.45), 0.25, make_shared<dielectric>(1.5)));
    return;
  }

  if (scene_id == 2) {
    auto ground = make_shared<lambertian>(
        make_shared<checker_texture>(0.5, color(0.2, 0.3, 0.1), color(0.9, 0.9, 0.9)));
    world.add(make_shared<sphere>(point3(0, -1000, 0), 1000, ground));
    auto tex = make_shared<lambertian>(image_texture::make_demo(32, 32));
    for (int z = -2; z <= 2; ++z) {
      for (int x = -2; x <= 2; ++x) {
        auto cube = make_cube_mesh(tex, point3(x * 1.4, 0.5, z * 1.4), 0.9);
        cube.append_to(world);
      }
    }
    return;
  }

  if (scene_id == 3) {
    auto ground = make_shared<lambertian>(color(0.4, 0.4, 0.45));
    world.add(make_shared<quad>(point3(-12, 0, -12), vec3(24, 0, 0), vec3(0, 0, 24), ground));
    auto mat_a = make_shared<lambertian>(image_texture::make_demo(24, 24));
    auto mat_b = make_shared<metal>(color(0.7, 0.7, 0.75), 0.15);
    auto mat_c = make_shared<lambertian>(
        make_shared<uv_checker_texture>(6, color(0.8, 0.2, 0.2), color(0.9, 0.9, 0.9)));
    int n = 0;
    for (int i = -5; i <= 5; ++i) {
      for (int j = -5; j <= 5; ++j) {
        shared_ptr<material> mat = mat_a;
        if (n % 3 == 1) mat = mat_b;
        if (n % 3 == 2) mat = mat_c;
        point3 c(i * 1.1 + 0.2 * (j % 2), 0.55, j * 1.1);
        if ((i + j) % 2 == 0)
          make_crystal_mesh(mat, c, 0.45).append_to(world);
        else
          make_cube_mesh(mat, c, 0.7).append_to(world);
        ++n;
      }
    }
    return;
  }

  auto ground = make_shared<lambertian>(color(0.5, 0.5, 0.5));
  world.add(make_shared<sphere>(point3(0, -1000, 0), 1000, ground));
  world.add(make_shared<sphere>(point3(0, 1, 0), 1.0, make_shared<dielectric>(1.5)));
  world.add(make_shared<sphere>(point3(-2, 1, 0), 1.0, make_shared<lambertian>(color(0.4, 0.2, 0.1))));
  world.add(make_shared<sphere>(point3(2, 1, 0), 1.0, make_shared<metal>(color(0.7, 0.6, 0.5), 0.0)));
}
