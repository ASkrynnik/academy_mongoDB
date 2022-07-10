'use strict'

const {mapUser, mapArticle, getRandomFirstName} = require('./util')
const students = require('./students.json')

// db connection and settings
const connection = require('./config/connection')
let userCollection
let articlesCollection
let studentsCollection
run()

async function run() {
  await connection.connect()
  await connection.get().dropCollection('users')
  await connection.get().createCollection('users')
  userCollection = await connection.get().collection('users')


  // await connection.get().dropCollection('articles')
  // await connection.get().createCollection('articles')
  // articlesCollection = await connection.get().collection('articles')


  // await connection.get().dropCollection('students')
  // await connection.get().createCollection('students')
  // studentsCollection = await connection.get().collection('students')

  // #### Users
  await example1()
  await example2()
  await example3()
  await example4()

  // #### Articles
  // await example5()
  // await example6()
  // await example7()
  // await example8()
  // await example9()

  // #### Students
  // await example10()
  // await example11()
  // await example12()
  // await example13()
  // await example14()
  // await example15()
  // await example16()
  await connection.close()
}

// #### Users

// - Create 2 users per department (a, b, c)
async function example1() {

  try {
    await userCollection.insertMany([
      mapUser({department: 'a'}),
      mapUser({department: 'a'}),
      mapUser({department: 'b'}),
      mapUser({department: 'b'}),
      mapUser({department: 'c'}),
      mapUser({department: 'c'}),
    ]);
  } catch (err) {
    console.error(err)
  }
}

// - Delete 1 user from department (a)

async function example2() {
  try {
    await userCollection.deleteOne({department: 'a'});
  } catch (err) {
    console.error(err)
  }
}

// - Update firstName for users from department (b)

async function example3() {
  try {
    await userCollection.updateMany({department: 'b'}, {$set: {firstName: getRandomFirstName}});
  } catch (err) {
    console.error(err)
  }
}

// - Find all users from department (c)
async function example4() {
  try {
    const res = await userCollection.find({department: 'c'}).toArray();
  } catch (err) {
    console.error(err)
  }
}

// #### Articles

// - Create 5 articles per each type (a, b, c)
async function example5() {
  try {
    ['a', 'b', 'c'].forEach(async(type) => {
      for(let i = 0; i < 5; i++) {
        await articlesCollection.insertOne(mapArticle({type}))
      }
    })
  } catch (err) {
    console.error(err)
  }
}

// - Find articles with type a, and update tag list with next value [‘tag1-a’, ‘tag2-a’, ‘tag3’]
async function example6() {
  try {
    await articlesCollection.updateMany({type: 'a'}, {$set: {tags: ['tag1-a', 'tag2-a', 'tag3']}})
  } catch (err) {
    console.error(err)
  }
}

// - Add tags [‘tag2’, ‘tag3’, ‘super’] to other articles except articles from type a
async function example7() {
  try {
    await articlesCollection.updateMany({type: { $ne: 'a'}}, {$set: {tags: ['tag1-a', 'tag2-a', 'tag3']}})
  } catch (err) {
    console.error(err)
  }
}

// - Find all articles that contains tags 'tag2' or 'tag1-a'
async function example8() {
  try {
    await articlesCollection.find({tags: {$in: ['tag2', 'tag1-a']}})
  } catch (err) {
    console.error(err)
  }
}

//- Pull [tag2, tag1-a] from all articles
async function example9() {
  try {
    await articlesCollection.updateMany({tags: {$in: ['tag2', 'tag1-a']}}, {$pull: {tags: ['tag2', 'tag1-a']}})
  } catch (err) {
    console.error(err)
  }
}

// #### Students

// - Import all data from students.json into student collection
async function example10() {
  try {
    await studentsCollection.insertMany(students);
  } catch (err) {
    console.error(err)
  }
}

// - Find all students who have the worst score for homework, sort by descent
async function example11() {
  try {
    await studentsCollection.aggregate([
      {
        '$match': {
          'scores': {
            '$elemMatch': {
              'score': {
                '$lte': 40
              }, 
              'type': 'homework'
            }
          }
        }
      }, {
        '$unwind': '$scores'
      }, {
        '$match': {
          'scores.type': 'homework'
        }
      }, {
        '$sort': {
          'scores.score': -1
        }
      }
    ])
  } catch (err) {
    console.error(err)
  }
}

// - Find all students who have the best score for quiz and the worst for homework, sort by ascending
async function example12() {
  try {
    await studentsCollection.aggregate([
      {
        '$match': { '$and': [
          {
            'scores': {
              '$elemMatch': {
                'score': {
                  '$lte': 40
                }, 
                'type': 'homework'
              }
            }
          }, 
          {
            'scores': {
              '$elemMatch': {
                'score': {
                  '$gte': 90
                }, 
                'type': 'quiz'
              }
            }
          }
        ]
        }
      },
      {
        $sort: {
            'scores.score': 1
        }
      }
    ]);
  } catch (err) {
    console.error(err)
  }
}

// - Find all students who have best scope for quiz and exam
async function example13() {
  try {
    await studentsCollection.aggregate([
      {
        '$match': { '$and': [
          {
            'scores': {
              '$elemMatch': {
                'score': {
                  '$gte': 90
                }, 
                'type': 'exam'
              }
            }
          }, 
          {
            'scores': {
              '$elemMatch': {
                'score': {
                  '$gte': 90
                }, 
                'type': 'quiz'
              }
            }
          }
        ]
        }
      }
    ]);
  } catch (err) {
    console.error(err)
  }
}

// - Calculate the average score for homework for all students
async function example14() {
  try {
    await studentsCollection.aggregate([
      {
        '$unwind': '$scores'
      }, {
        '$match': {
          'scores.type': 'homework'
        }
      }, {
        '$group': {
          '_id': null, 
          'hwAverage': {
            '$avg': '$scores.score'
          }
        }
      }
    ]);
  } catch (err) {
    console.error(err)
  }
}

// - Delete all students that have homework score <= 60
async function example15() {
  try {
    await studentsCollection.deleteMany({
      'scores': {
        '$elemMatch': {
          'score': {
            '$lte': 60
          },
          'type': 'homework'
        }
      }
    });
  } catch (err) {
    console.error(err)
  }
}

// - Mark students that have quiz score => 80
async function example16() {
  try {
    await studentsCollection.updateMany({
      'scores': {
        '$elemMatch': {
          'score': {
            '$gte': 80
          },
          'type': 'quiz'
        }
      }
    }, {'$set': {marked: true}});
  } catch (err) {
    console.error(err)
  }
}
