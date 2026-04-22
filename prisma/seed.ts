// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ─────────────────────────────────────────
// CONSTANTES DEL CONJUNTO
// ─────────────────────────────────────────

const TOWERS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2', 'F1', 'F2']
const REGULAR_FLOORS = [1, 2, 3, 4]        // 4 apartamentos por piso
const TOP_FLOOR = 5                          // 8 apartamentos
const REGULAR_APTS_PER_FLOOR = 4
const TOP_FLOOR_APTS = 8

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

/**
 * Genera el número de apartamento con formato "101", "502", etc.
 * Siempre 3 dígitos: piso + número con cero a la izquierda si aplica
 */
function aptNumber(floor: number, unit: number): string {
  return `${floor}${String(unit).padStart(2, '0')}`
}

/**
 * Genera contraseña temporal legible
 * Formato: TorreApto@Año → ej: A1101@2025
 */
function tempPassword(tower: string, aptNum: string): string {
  const year = new Date().getFullYear()
  return `${tower}${aptNum}@${year}`
}

// ─────────────────────────────────────────
// FUNCIONES DE CREACIÓN
// ─────────────────────────────────────────

async function createApartments() {
  console.log('🏢 Creando apartamentos...')

  const apartments = []

  for (const tower of TOWERS) {
    // Pisos 1 al 4 → 4 apartamentos cada uno
    for (const floor of REGULAR_FLOORS) {
      for (let unit = 1; unit <= REGULAR_APTS_PER_FLOOR; unit++) {
        const number = aptNumber(floor, unit)
        apartments.push({
          tower,
          floor,
          number,
          identifier: `${tower}-${number}`, // "A1-101"
        })
      }
    }

    // Piso 5 → 8 apartamentos (caso especial)
    for (let unit = 1; unit <= TOP_FLOOR_APTS; unit++) {
      const number = aptNumber(TOP_FLOOR, unit)
      apartments.push({
        tower,
        floor: TOP_FLOOR,
        number,
        identifier: `${tower}-${number}`, // "A1-501" ... "A1-508"
      })
    }
  }

  // Inserción masiva (más eficiente que insertar uno por uno)
  await prisma.apartment.createMany({
    data: apartments,
    skipDuplicates: true, // si ya existe, no falla
  })

  const count = await prisma.apartment.count()
  console.log(`   ✅ ${count} apartamentos creados`)
}

async function createAdmin() {
  console.log('👤 Creando administrador...')

  const password = 'Admin@2025'
  const hashed = await bcrypt.hash(password, 12)

  await prisma.user.upsert({
    where: { email: 'admin@conjunto.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@conjunto.com',
      password: hashed,
      role: Role.ADMIN,
      mustChangePassword: false, // el admin ya conoce su contraseña
    },
  })

  console.log('   ✅ Admin creado')
  console.log('   📧 Email:    admin@conjunto.com')
  console.log(`   🔑 Password: ${password}`)
}

async function createPorteros() {
  console.log('👮 Creando porteros...')

  const porteros = [
    { name: 'Portero Turno Día',   email: 'portero1@conjunto.com', password: 'Portero1@2025' },
    { name: 'Portero Turno Noche', email: 'portero2@conjunto.com', password: 'Portero2@2025' },
    { name: 'Portero Fin Semana',  email: 'portero3@conjunto.com', password: 'Portero3@2025' },
  ]

  for (const portero of porteros) {
    const hashed = await bcrypt.hash(portero.password, 12)

    await prisma.user.upsert({
      where: { email: portero.email },
      update: {},
      create: {
        name: portero.name,
        email: portero.email,
        password: hashed,
        role: Role.PORTERO,
        mustChangePassword: true,
      },
    })

    console.log(`   ✅ ${portero.name}`)
    console.log(`      📧 ${portero.email}  🔑 ${portero.password}`)
  }
}

// ─────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────

async function main() {
  console.log('\n🌱 Iniciando seed del conjunto residencial...\n')

  await createApartments()
  await createAdmin()
  await createPorteros()

  console.log('\n✅ Seed completado exitosamente')
  console.log('📊 Resumen:')

  const [apts, users] = await Promise.all([
    prisma.apartment.count(),
    prisma.user.count(),
  ])

  console.log(`   🏢 Apartamentos: ${apts}`)
  console.log(`   👤 Usuarios:     ${users}`)
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })