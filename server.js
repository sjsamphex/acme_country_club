const Sequelize = require('sequelize');
const express = require('express');

const { STRING, UUID, UUIDV4, DATE } = Sequelize;
const app = express();

const db = new Sequelize(
  process.env.DATABASE_URL || 'postgres://localhost/acme_countryclub_db'
);

const Facility = db.define('facility', {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  name: {
    type: STRING(100),
    allowNull: false,
    unique: true,
  },
});

const Member = db.define('member', {
  id: {
    type: UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
  },
  first_name: {
    type: STRING(20),
    allowNull: false,
    unique: true,
  },
});

const Booking = db.define('booking', {
  startTime: {
    type: DATE,
    allowNull: false,
  },
  endTime: {
    type: DATE,
    allowNull: false,
  },
});

Member.belongsTo(Member, { as: 'sponsor' });
Booking.belongsTo(Member, { as: 'bookedBy' });
Booking.belongsTo(Facility);
// Member.belongsTo(Member, { as: 'sponsor' });
// Member.hasMany(Member, { as: 'sponsored', foreignKey: 'sponsorId'});

const syncAndSeed = async () => {
  await db.sync({ force: true });

  const [tennis, golf, basketball] = await Promise.all([
    Facility.create({ name: 'tennis' }),
    Facility.create({ name: 'golf' }),
    Facility.create({ name: 'basketball' }),
  ]);

  const [lucy, moe, larry] = await Promise.all([
    Member.create({ first_name: 'lucy' }),
    Member.create({ first_name: 'moe' }),
    Member.create({ first_name: 'larry' }),
  ]);

  const [booking1, booking2, booking3] = await Promise.all([
    Booking.create({ startTime: new Date(), endTime: new Date() }),
    Booking.create({ startTime: new Date(), endTime: new Date() }),
    Booking.create({ startTime: new Date(), endTime: new Date() }),
  ]);

  moe.sponsorId = lucy.id;

  //console.log(moe.get());
  booking1.bookedById = lucy.id;
  booking1.facilityId = tennis.id;
  await Promise.all([moe.save(), booking1.save()]);
};

app.get('/api/bookings', async (req, res, next) => {
  try {
    res.send(
      await Booking.findAll({
        include: [
          {
            model: Member,
            as: 'bookedBy',
          },
          Facility,
        ],
      })
    );
  } catch (er) {
    next(er);
  }
});

const init = async () => {
  try {
    await db.authenticate();
    await syncAndSeed();

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Listening on port: ${port}`));
  } catch (ex) {
    console.log(ex);
  }
};

init();

//profs solution from slack:

/*  
//models
const Sequelize = require('sequelize');
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_country_club');
const { DATE, STRING, UUID, UUIDV4 } = Sequelize;
const Facility = conn.define('facility', {
  fac_name: STRING(100)
});
const Member = conn.define('member', {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true
  },
  first_name: {
    type: STRING(20),
  }
});
const Booking = conn.define('booking', {
  startTime: {
    type: DATE,
    allowNull: false
  },
  endTime: {
    type: DATE,
    allowNull: false
  },
});
Booking.belongsTo(Member, { as: 'bookedBy' });
Booking.belongsTo(Facility);
Facility.hasMany(Booking);
Member.belongsTo(Member, { as: 'sponsor' });
Member.hasMany(Member, { as: 'sponsored', foreignKey: 'sponsorId'});
const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  const [tennis, raquetball] = await Promise.all([
    Facility.create({ fac_name: 'tennis'}),
    Facility.create({ fac_name: 'raquetball'}),
  ]);
  const [lucy, moe, larry] = await Promise.all([
    Member.create({ first_name: 'lucy'}),
    Member.create({ first_name: 'moe'}),
    Member.create({ first_name: 'larry'})
  ]);
  lucy.sponsorId = moe.id;
  larry.sponsorId = lucy.id
  await Promise.all([
    lucy.save(), larry.save()
  ]);
  const ONE_DAY = 1000 * 60 * 60 * 24;
  const ONE_HOUR = 1000 * 60 * 60;
  Promise.all([
    Booking.create({ bookedById: moe.id, facilityId: tennis.id, startTime: new Date(), endTime: new Date()}),
    Booking.create({ bookedById: moe.id, facilityId: raquetball.id, startTime: new Date(new Date().getTime() + ONE_DAY), endTime: new Date( new Date().getTime() + ONE_DAY + ONE_HOUR)}),
  ]);
};
//express and routes
const express = require('express');
const app = express();
app.get('/api/facilities', async(req, res, next)=> {
  try {
    res.send(await Facility.findAll({
      include: [ Booking ]
    }))
  }
  catch(ex){
    next(ex);
  }
});
app.get('/api/members', async(req, res, next)=> {
  try {
    res.send(await Member.findAll({
      include: [
        { model: Member, as: 'sponsor' },
        { model: Member, as: 'sponsored' }
      ]
    }))
  }
  catch(ex){
    next(ex);
  }
});
app.get('/api/bookings', async(req, res, next)=> {
  try {
    res.send(await Booking.findAll({
      include: [
        { model: Member, as: 'bookedBy' },
        Facility
      ]
    }))
  }
  catch(ex){
    next(ex);
  }
});
const init = async()=> {
  try {
    await conn.authenticate();
    await syncAndSeed();
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> console.log(`listening on port ${port}`));
  }
  catch(ex){
    console.log(ex);
  }
};
init();
*/
