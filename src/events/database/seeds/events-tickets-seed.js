const { faker } = require('@faker-js/faker')

exports.seed = async function(knex) {
  // create events and tickets for those events
  for (let i = 0; i < 100; i++) {
    await knex('events').insert({
      name: faker.lorem.words(),
      description: faker.lorem.paragraph(),
      date: faker.date.future(),
      location: faker.location.city(),
    })
  }
  const events = await knex('events').select('id')
  for (const event of events) {
    // create a 500 allotment of tickets for this event
    for (let j = 0; j < 500; j++) {
      await knex('tickets').insert({
        event_id: event.id,
        status: faker.helpers.arrayElement(['available', 'sold', 'reserved']),
        type: 'general',
        price: 1000,
      });
    }
  }
}
