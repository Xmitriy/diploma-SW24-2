import { connectDB } from "@/app/lib/mongodb";
import Blog from "@/models/blog";
import User from "@/models/user";
import mongoose from "mongoose";

const mockPosts = [
  {
    title: "Getting Started with Healthy Eating",
    content: `Healthy eating is fundamental to maintaining good health and well-being. Here are some key principles to get you started:

1. Eat a variety of foods
2. Include plenty of fruits and vegetables
3. Choose whole grains over refined grains
4. Include lean proteins
5. Stay hydrated

Remember, small changes can lead to big results over time.`,
    description:
      "A beginner's guide to healthy eating habits and nutrition basics.",
    views: 0,
  },
  {
    title: "The Importance of Regular Exercise",
    content: `Regular exercise is crucial for both physical and mental health. Here's why:

1. Improves cardiovascular health
2. Strengthens muscles and bones
3. Boosts mood and mental health
4. Helps maintain a healthy weight
5. Increases energy levels

Start with small, achievable goals and gradually increase intensity.`,
    description:
      "Understanding the benefits of regular physical activity and how to incorporate it into your daily routine.",
    views: 0,
  },
  {
    title: "Mindful Eating: A Path to Better Health",
    content: `Mindful eating is about being present while you eat. Here's how to practice it:

1. Eat without distractions
2. Listen to your body's hunger cues
3. Savor each bite
4. Notice the flavors and textures
5. Stop when you're satisfied

This practice can help you develop a healthier relationship with food.`,
    description:
      "Learn about mindful eating and how it can improve your relationship with food and overall health.",
    views: 0,
  },
  {
    title: "Sleep and Recovery: The Missing Link",
    content: `Quality sleep is essential for recovery and overall health. Here's what you need to know:

1. Aim for 7-9 hours of sleep
2. Maintain a consistent sleep schedule
3. Create a relaxing bedtime routine
4. Optimize your sleep environment
5. Limit screen time before bed

Good sleep is crucial for physical recovery and mental well-being.`,
    description:
      "Understanding the importance of sleep and recovery in your health journey.",
    views: 0,
  },
  {
    title: "Building Sustainable Habits",
    content: `Creating lasting healthy habits takes time and consistency. Here's how to do it:

1. Start small and specific
2. Track your progress
3. Celebrate small wins
4. Stay consistent
5. Adjust as needed

Remember, it's about progress, not perfection.`,
    description:
      "Learn how to build and maintain healthy habits that last a lifetime.",
    views: 0,
  },
];

async function seedPosts() {
  try {
    await connectDB();

    // Find a user to be the author (using the first user found)
    const user = await User.findOne();
    if (!user) {
      console.error(
        "No users found in the database. Please create a user first."
      );
      process.exit(1);
    }

    // Add author ID to each post
    const postsWithAuthor = mockPosts.map((post) => ({
      ...post,
      author: user._id,
    }));

    // Clear existing posts
    await Blog.deleteMany({});

    // Insert new posts
    const createdPosts = await Blog.insertMany(postsWithAuthor);
    console.log(`Successfully seeded ${createdPosts.length} posts`);

    // Update user's posts array
    await User.findByIdAndUpdate(user._id, {
      $push: { posts: { $each: createdPosts.map((post) => post._id) } },
    });

    console.log("Posts seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding posts:", error);
    process.exit(1);
  }
}

seedPosts();
