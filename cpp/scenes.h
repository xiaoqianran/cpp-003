// cpp-003 场景：纹理 · 三角网格 · OBJ · 作业房间
#pragma once

#include "hittable.h"
#include "loader_obj.h"
#include "material.h"
#include "mesh.h"
#include "quad.h"
#include "sphere.h"
#include "texture.h"
#include <vector>

// 0 棋盘 + 贴图球
// 1 纹理康奈尔 + mesh
// 2 作业房间（OBJ 奖杯 + 家具）
// 3 晶簇 BVH 压力
// 4 经典三球
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

    world.add(make_shared<quad>(point3(-1, 0, -1), vec3(2, 0, 0), vec3(0, 2, 0), white));
    world.add(make_shared<quad>(point3(-1, 0, 1), vec3(0, 0, -2), vec3(0, 2, 0), red));
    world.add(make_shared<quad>(point3(1, 0, -1), vec3(0, 0, 2), vec3(0, 2, 0), green));
    world.add(make_shared<quad>(point3(-1, 0, 1), vec3(2, 0, 0), vec3(0, 0, -2), floor_tex));
    world.add(make_shared<quad>(point3(-1, 2, -1), vec3(2, 0, 0), vec3(0, 0, 2), white));
    auto lamp =
        make_shared<quad>(point3(-0.25, 1.99, -0.25), vec3(0.5, 0, 0), vec3(0, 0, 0.5), light);
    world.add(lamp);
    lights.push_back(lamp);

    make_crystal_mesh(make_shared<lambertian>(image_texture::make_demo(48, 48)),
                      point3(-0.35, 0.45, 0.1), 0.4)
        .append_to(world);
    make_cube_mesh(
        make_shared<lambertian>(
            make_shared<uv_checker_texture>(4, color(0.9, 0.7, 0.2), color(0.2, 0.25, 0.5))),
        point3(0.4, 0.3, -0.15), 0.55)
        .append_to(world);
    world.add(make_shared<sphere>(point3(0.15, 0.25, 0.45), 0.25, make_shared<dielectric>(1.5)));
    return;
  }

  if (scene_id == 2) {
    // —— 作业房间：地板 + 墙 + 桌椅(立方) + OBJ 奖杯 + 灯 ——
    auto wall = make_shared<lambertian>(color(0.82, 0.8, 0.75));
    auto floor = make_shared<lambertian>(
        make_shared<uv_checker_texture>(12, color(0.25, 0.22, 0.2), color(0.55, 0.5, 0.42)));
    auto wood = make_shared<lambertian>(image_texture::make_wood(128, 128));
    auto metal_leg = make_shared<metal>(color(0.55, 0.55, 0.58), 0.2);
    auto light = make_shared<diffuse_light>(color(12, 11, 10));
    auto fabric = make_shared<lambertian>(color(0.15, 0.25, 0.45));

    // 房间 x[-3,3] z[-3,2] y[0,2.6]
    world.add(make_shared<quad>(point3(-3, 0, 2), vec3(6, 0, 0), vec3(0, 0, -5), floor));
    world.add(make_shared<quad>(point3(-3, 0, -3), vec3(6, 0, 0), vec3(0, 2.6, 0), wall));
    world.add(make_shared<quad>(point3(-3, 0, 2), vec3(0, 0, -5), vec3(0, 2.6, 0),
                                make_shared<lambertian>(color(0.75, 0.78, 0.82))));
    world.add(make_shared<quad>(point3(3, 0, -3), vec3(0, 0, 5), vec3(0, 2.6, 0),
                                make_shared<lambertian>(color(0.78, 0.75, 0.7))));
    world.add(make_shared<quad>(point3(-3, 2.6, -3), vec3(6, 0, 0), vec3(0, 0, 5),
                                make_shared<lambertian>(color(0.9, 0.9, 0.88))));

    auto lamp =
        make_shared<quad>(point3(-0.8, 2.55, -0.8), vec3(1.6, 0, 0), vec3(0, 0, 1.2), light);
    world.add(lamp);
    lights.push_back(lamp);

    // 桌子：扁桌面 + 四腿
    make_box_mesh(wood, point3(0, 0.74, -0.3), vec3(0.9, 0.04, 0.55)).append_to(world);
    for (double dx : {-0.75, 0.75}) {
      for (double dz : {-0.7, 0.15}) {
        make_box_mesh(metal_leg, point3(dx, 0.37, dz - 0.3), vec3(0.04, 0.37, 0.04)).append_to(world);
      }
    }

    // 椅子：座面 + 靠背
    make_box_mesh(fabric, point3(-1.55, 0.42, 0.55), vec3(0.28, 0.04, 0.28)).append_to(world);
    make_box_mesh(wood, point3(-1.55, 0.7, 0.32), vec3(0.28, 0.28, 0.04)).append_to(world);
    for (double dx : {-0.22, 0.22}) {
      for (double dz : {-0.18, 0.18}) {
        make_box_mesh(wood, point3(-1.55 + dx, 0.2, 0.55 + dz), vec3(0.03, 0.2, 0.03)).append_to(world);
      }
    }

    // OBJ 奖杯（内嵌字符串）
    auto gold = make_shared<metal>(color(0.9, 0.75, 0.3), 0.12);
    auto trophy =
        load_obj_string(k_builtin_trophy_obj(), gold, point3(0.15, 0.82, -0.25), 0.55, 0.4);
    trophy.append_to(world);

    // 小四面体装饰
    auto tet = load_obj_string(k_builtin_tetra_obj(),
                               make_shared<lambertian>(image_texture::make_demo(32, 32)),
                               point3(0.7, 0.95, -0.5), 0.18, 0.8);
    tet.append_to(world);

    // 窗玻璃感球体
    world.add(make_shared<sphere>(point3(2.2, 1.2, -1.5), 0.35, make_shared<dielectric>(1.5)));
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
  world.add(
      make_shared<sphere>(point3(-2, 1, 0), 1.0, make_shared<lambertian>(color(0.4, 0.2, 0.1))));
  world.add(
      make_shared<sphere>(point3(2, 1, 0), 1.0, make_shared<metal>(color(0.7, 0.6, 0.5), 0.0)));
}
