import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Roles
  const roles = ["ADMIN", "MANAGER", "CASHIER", "KITCHEN"];
  const createdRoles = await Promise.all(
    roles.map(name =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name, permissions: [] },
      })
    )
  );
  
  const adminRole = createdRoles.find(r => r.name === "ADMIN")!;
  const managerRole = createdRoles.find(r => r.name === "MANAGER")!;
  const cashierRole = createdRoles.find(r => r.name === "CASHIER")!;
  const kitchenRole = createdRoles.find(r => r.name === "KITCHEN")!;

  // 2. Users (Without Better Auth specific linking for now, just core users)
  const users = [
    { name: "Admin User", email: "admin@example.com", roleId: adminRole.id },
    { name: "Manager User", email: "manager@example.com", roleId: managerRole.id },
    { name: "Cashier User", email: "cashier@example.com", roleId: cashierRole.id },
    { name: "Kitchen User", email: "kitchen@example.com", roleId: kitchenRole.id },
  ];

  const createdUsers = await Promise.all(
    users.map(u =>
      prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          name: u.name,
          email: u.email,
          emailVerified: true,
        }
      })
    )
  );

  // 3. Restaurant and Outlet
  const restaurant = await prisma.restaurant.create({
    data: { name: "Demo Restaurant" },
  });

  const outlet = await prisma.outlet.create({
    data: {
      name: "Main Branch",
      restaurantId: restaurant.id,
    },
  });

  // Link users to restaurant
  for (let i = 0; i < createdUsers.length; i++) {
    await prisma.restaurantUser.create({
      data: {
        userId: createdUsers[i].id,
        restaurantId: restaurant.id,
        roleId: users[i].roleId,
      }
    });
  }

  // 4. Tables T1-T8
  const tableNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"];
  await Promise.all(
    tableNames.map(name =>
      prisma.restaurantTable.create({
        data: {
          name,
          outletId: outlet.id,
          capacity: 4,
        }
      })
    )
  );

  // 5. Categories
  const categoryNames = ["Starters", "Main Course", "Breads", "Rice", "Beverages", "Desserts"];
  const categories = await Promise.all(
    categoryNames.map((name, i) =>
      prisma.menuCategory.create({
        data: {
          name,
          outletId: outlet.id,
          displayOrder: i,
        }
      })
    )
  );

  const starters = categories.find(c => c.name === "Starters")!;
  const mainCourse = categories.find(c => c.name === "Main Course")!;
  const breads = categories.find(c => c.name === "Breads")!;
  const rice = categories.find(c => c.name === "Rice")!;
  const beverages = categories.find(c => c.name === "Beverages")!;
  const desserts = categories.find(c => c.name === "Desserts")!;

  // 6. Menu Items
  const menuItems = [
    { name: "Paneer Tikka", categoryId: starters.id, price: 250, isVeg: true },
    { name: "Chicken Tikka", categoryId: starters.id, price: 320, isVeg: false },
    { name: "Crispy Corn", categoryId: starters.id, price: 200, isVeg: true },
    { name: "Spring Rolls", categoryId: starters.id, price: 180, isVeg: true },
    
    { name: "Butter Chicken", categoryId: mainCourse.id, price: 450, isVeg: false },
    { name: "Paneer Butter Masala", categoryId: mainCourse.id, price: 380, isVeg: true },
    { name: "Dal Makhani", categoryId: mainCourse.id, price: 280, isVeg: true },
    { name: "Kadai Paneer", categoryId: mainCourse.id, price: 350, isVeg: true },
    { name: "Mutton Rogan Josh", categoryId: mainCourse.id, price: 550, isVeg: false },
    
    { name: "Butter Naan", categoryId: breads.id, price: 60, isVeg: true },
    { name: "Garlic Naan", categoryId: breads.id, price: 80, isVeg: true },
    { name: "Tandoori Roti", categoryId: breads.id, price: 40, isVeg: true },
    { name: "Lachha Paratha", categoryId: breads.id, price: 70, isVeg: true },
    
    { name: "Jeera Rice", categoryId: rice.id, price: 150, isVeg: true },
    { name: "Chicken Biryani", categoryId: rice.id, price: 380, isVeg: false },
    { name: "Veg Pulao", categoryId: rice.id, price: 220, isVeg: true },
    
    { name: "Coke", categoryId: beverages.id, price: 60, isVeg: true },
    { name: "Fresh Lime Soda", categoryId: beverages.id, price: 90, isVeg: true },
    { name: "Cold Coffee", categoryId: beverages.id, price: 150, isVeg: true },
    
    { name: "Gulab Jamun", categoryId: desserts.id, price: 120, isVeg: true },
    { name: "Rasmalai", categoryId: desserts.id, price: 160, isVeg: true },
    { name: "Brownie with Ice Cream", categoryId: desserts.id, price: 220, isVeg: true },
  ];

  await prisma.menuItem.createMany({
    data: menuItems.map(item => ({
      ...item,
      taxRate: 5,
    })),
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
