//node --input-type=module -e "import { writeFileSync } from 'node:fs'; import { candidateData } from './src/generateCandidateData.js'; const out = candidateData.slice(0, 50000); writeFileSync('./src/candidateData5000.js', 'export const candidateData = ' + JSON.stringify(out, null, 2) + ';\n'); console.log('Wrote', out.length, 'records to src/candidateData5000.js');"
const RECORD_COUNT = 50000

const surnames = ['Panchal', 'Suthar', 'Luhar', 'Mistry']
const maleNames = ['Harsh', 'Amit', 'Jay', 'Kunal', 'Rohan', 'Nirav', 'Yash', 'Dhruv']
const femaleNames = ['Nidhi', 'Riya', 'Mitali', 'Kavya', 'Priya', 'Hetal', 'Pooja', 'Asha']
const cities = [
    { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
    { city: 'Vadodara', state: 'Gujarat', country: 'India' },
    { city: 'Surat', state: 'Gujarat', country: 'India' },
    { city: 'Rajkot', state: 'Gujarat', country: 'India' },
    { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    { city: 'Pune', state: 'Maharashtra', country: 'India' },
    { city: 'Fremont', state: 'California', country: 'Usa' },
    { city: 'Jersey City', state: 'New Jersey', country: 'Usa' },
]
const qualifications = ['Btech', 'Mtech', 'BCA']
const streams = ['Computer Science', 'Mechanical Engineering', 'Civil Engineering', 'Information Technology']
const occupations = ['Software Engineer', 'Business Owner', 'Project Manager', 'Consultant', 'Designer']
const bloodChoices = ['Mangal - No, Shani - No', 'Mangal - Yes, Shani - No', 'Mangal - No, Shani - Yes']

function makeDob(age, index) {
    const year = new Date().getFullYear() - age
    const month = String((index % 12) + 1).padStart(2, '0')
    const day = String((index % 28) + 1).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function makeCandidate(index) {
    const serial = index + 1
    const id = `PP${String(serial).padStart(3, '0')}`
    const gender = serial % 2 === 0 ? 'Female' : 'Male'
    const surname = surnames[index % surnames.length]
    const namePool = gender === 'Male' ? maleNames : femaleNames
    const name = namePool[index % namePool.length]
    const location = cities[index % cities.length]
    const qualification = qualifications[index % qualifications.length]
    const age = 18 + (index % 38)
    const stream = streams[index % streams.length]
    const occupation = occupations[index % occupations.length]
    const familyIncome = `${12 + (index % 18)},00,000 INR`
    const annualIncome =
        location.country === 'Usa'
            ? `${70 + (index % 60)},000 USD`
            : `${6 + (index % 18)},50,000 INR`

    return {
        id,
        gender,
        aboutMe: {
            surname,
            name,
            age,
            height: `5'${2 + (index % 10)}"`,
            weight: `${50 + (index % 35)} kg`,
            qualification,
            stream,
            occupation,
            incomeAnnual: annualIncome,
        },
        aboutMyFamily: {
            nativePlace: location.city,
            fatherName: `Father ${surname} ${serial}`,
            fatherOccupation: occupations[(index + 1) % occupations.length],
            motherName: `Mother ${surname} ${serial}`,
            motherOccupation: index % 3 === 0 ? 'Teacher' : 'Homemaker',
            brothers: String(index % 3),
            sisters: String((index + 1) % 3),
            incomeAnnual: familyIncome,
        },
        moreDetails: {
            dob: makeDob(age, index),
            birthTime: `${String((index % 12) + 1).padStart(2, '0')}:${String((index * 7) % 60).padStart(2, '0')} ${index % 2 === 0 ? 'AM' : 'PM'}`,
            birthPlace: location.city,
            spect: index % 5 === 0 ? 'Yes' : 'No',
            mangalShani: bloodChoices[index % bloodChoices.length],
            disability: 'No',
            moreDetailsAboutMeAndMyChoice:
                'Looking for a respectful, family-oriented partner with shared values.',
        },
        contactAddress: {
            address: `Street ${100 + index}`,
            city: location.city,
            state: location.state,
            country: location.country,
            pincode: String(100000 + (index % 900000)),
            phoneMobile: `+91 9${String(100000000 + index).slice(0, 9)}`,
            email: `${id.toLowerCase()}@panchalparichay.in`,
        },
    }
}

export const candidateData = Array.from({ length: RECORD_COUNT }, (_, index) =>
    makeCandidate(index)
)

