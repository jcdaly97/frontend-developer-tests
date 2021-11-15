import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Dropdown, DropdownButton } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../App.css'

//________Interfaces___________________
interface RawUser {
	gender: string
	name: {
		first: string
		last: string
	}
	location: {
		country: string
		city: string
		state: string
	}
	registered: {
		date: string
	}
}

interface User {
	name: string
	gender: string
	city: string
	state: string
	registered: string
}

interface Country {
	name: string
	users: number
}


//_______Fetch_Api_Data___________
//custom hook to grab data from api
const useFetch = () => {
	const [userData, setUserData] = useState<RawUser[]>([])
	const [loading, setLoading] = useState(true)
	useEffect(() => {
		axios.get('https://randomuser.me/api/?results=100')
			.then((res) => {
				setUserData(res.data.results)
				setLoading(false)
			}).catch((err) => {
				console.log(err)
			})
	}, [])

	return { userData, loading }
}



export default function ItemList() {

	//____________State_______________
	//filtered country data to be displayed
	const [countryList, setCountryList] = useState<Country[]>([])
	//user objects for selected country
	const [userList, setUserList] = useState<User[]>([])
	//array of the user objects that will actually get displayed
	const [filteredUsers, setFilteredUsers] = useState<User[]>([])
	//boolean for if the elements in displayed are countries or users
	const [countrySelected, setCountrySelected] = useState(false)
	//grab raw data using the custom hook
	const { userData, loading } = useFetch()

	//transform the data in a sorted list of countries
	useEffect(() => {
		//create a dictionary of countries and count users for each
		const countryObject: any = {}
		userData.map((user) => {
			let countryName = user.location.country
			if (countryName in countryObject) {
				countryObject[countryName] = countryObject[countryName] + 1
			} else {
				countryObject[countryName] = 1
			}
		})
		//transform the dictionary to an array of tuples and sort it
		const countryTuples = Object.entries(countryObject)
		countryTuples.sort((a: any, b: any) => {
			if (a[1] < b[1]) {
				return 1
			} else {
				return -1
			}
		})
		//turn the array of tuples to an array of country objects and update state
		const countries: Country[] = []
		countryTuples.map((tuple: any) => {
			let country = {
				name: tuple[0],
				users: tuple[1]
			}
			countries.push(country)
		})
		setCountryList(countries)
	}, [userData])

	//________Event_Handlers__________
	const handleCountrySelect = (countryName: string) => {
		const users: User[] = []
		userData.map((user) => {
			if (user.location.country == countryName) {
				let newUser = {
					name: user.name.first,
					gender: user.gender,
					city: user.location.city,
					state: user.location.state,
					registered: user.registered.date
				}
				users.push(newUser)
			}
		})
		setUserList(users)
		setFilteredUsers(users)
		setCountrySelected(true)
	}

	const handleBackButton = () => {
		setUserList([])
		setFilteredUsers([])
		setCountrySelected(false)
	}

	const handleDropdown = (e: any) => {
		return filterUsers(e)
	}

	const filterUsers = (e: string) => {
		switch (e) {
			case "1":
				//make a copy of the user list for a given country
				setFilteredUsers(userList.filter(user => user.gender === 'male'))
				break;
			case "2":
				//same as above
				setFilteredUsers(userList.filter(user => user.gender === 'female'))
				break;
			case "3":
				setFilteredUsers(userList)
				break;
			default:
				setFilteredUsers(userList)
		}
	}


	return (
		<div className='data-page'>

			{countrySelected ? (
				<>
					<div className='controls'>
						<button onClick={handleBackButton}>
							back
						</button>
						<DropdownButton
							title="Gender"
							id="size-menu"
							onSelect={(e) => handleDropdown(e)}
							key='Secondary'
						>
							<Dropdown.Item className="dropdown-item" eventKey="1">male</Dropdown.Item>
							<Dropdown.Item className="dropdown-item" eventKey="2">female</Dropdown.Item>
							<Dropdown.Item className="dropdown-item" eventKey="3">any</Dropdown.Item>
						</DropdownButton>

					</div>
					<div className='table'>
						<div id='row'>
							<div id='user-collumn'>name</div>
							<div id='user-collumn'>gender</div>
							<div id='user-collumn'>city</div>
							<div id='user-collumn'>state</div>
							<div id='user-collumn'>registered</div>
						</div>
						{filteredUsers.map((user: User) => {
							return (
								<div id='row'>
									<div id='user-collumn'>{user.name}</div>
									<div id='user-collumn'>{user.gender}</div>
									<div id='user-collumn'>{user.city}</div>
									<div id='user-collumn'>{user.state}</div>
									<div id='user-collumn'>{user.registered}</div>
								</div>
							)
						})}
					</div>
				</>
			) : (
				<div id='table'>
					<div id='row'>
						<div id='country-collumn'>country</div>
						<div id='country-collumn'>users</div>
					</div>
					{countryList.map((country: Country) => {
						return (
							<div id='row' onClick={() => handleCountrySelect(country.name)}>
								<div id='country-collumn'>{country.name}</div>
								<div id='country-collumn'>{country.users}</div>
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}
