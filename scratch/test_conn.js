import mongoose from 'mongoose';

const testURIs = {
  original: "mongodb+srv://yandrapallijaswanth_db_user:Jayanth@cluster0.t2lvw7n.mongodb.net/srisakthi?retryWrites=true&w=majority&appName=Cluster0",
  new_j: "mongodb+srv://Srisakthi:Jaswanth@cluster0.t2lvw7n.mongodb.net/srisakthi?retryWrites=true&w=majority&appName=Cluster0",
  new_J: "mongodb+srv://Srisakthi:Jaswanth22@cluster0.t2lvw7n.mongodb.net/srisakthi?retryWrites=true&w=majority&appName=Cluster0",
  admin: "mongodb+srv://Srisakthiadmin:jayanth10@cluster0.t2lvw7n.mongodb.net/srisakthi?retryWrites=true&w=majority&appName=Cluster0"
};

async function test() {
  for (const [key, uri] of Object.entries(testURIs)) {
    try {
      console.log(`Testing ${key}...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log(`✅ Success for ${key}!`);
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error(`❌ Failed for ${key}: ${err.message}`);
    }
  }
  process.exit(1);
}

test();
