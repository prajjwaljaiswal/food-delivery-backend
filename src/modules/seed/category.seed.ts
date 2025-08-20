import { DataSource } from 'typeorm';
import { Category } from 'src/models/category.entity';
import { Restaurant } from 'src/models/admin-restaurant.entity';

export const seedCategories = async (dataSource: DataSource) => {
  try {
    const categoryRepo = dataSource.getRepository(Category);
    const restaurantRepo = dataSource.getRepository(Restaurant);

    // ✅ List of restaurant IDs
    const restaurantIds = [1,1,1,1];

    const categoriesTemplate: Partial<Category>[] = [
      { name: 'Starters', description: 'Tasty starters', type: 'starter', priority: 1, tags: ['starter'], slug: 'starters', isActive: true, isVisible: true },
      { name: 'Main Course', description: 'Delicious main dishes', type: 'main', priority: 2, tags: ['main'], slug: 'main-course', isActive: true, isVisible: true },
      { name: 'Desserts', description: 'Sweet desserts', type: 'dessert', priority: 3, tags: ['dessert'], slug: 'desserts', isActive: true, isVisible: true },
      { name: 'Drinks', description: 'Refreshing beverages', type: 'drink', priority: 4, tags: ['drink'], slug: 'drinks', isActive: true, isVisible: true },
    ];

    for (const id of restaurantIds) {
      const restaurant = await restaurantRepo.findOne({ where: { id } });
      if (!restaurant) {
        console.log(`Restaurant with ID ${id} not found, skipping...`);
        continue;
      }

      for (const catTemplate of categoriesTemplate) {
        const existing = await categoryRepo.findOne({
          where: { name: catTemplate.name, restaurantId: restaurant.id },
        });

        if (!existing) {
          const category = categoryRepo.create({
            ...catTemplate,
            restaurant,
            restaurantId: restaurant.id,
          });
          await categoryRepo.save(category);
          console.log(`Category "${category.name}" seeded for restaurant ID ${restaurant.id}`);
        } else {
          console.log(`Category "${catTemplate.name}" already exists for restaurant ID ${restaurant.id}, skipping...`);
        }
      }
    }

    console.log('✅ Category seeding completed for all specified restaurants!');
  } catch (err) {
    console.error('Error seeding categories:', err);
  }
};
