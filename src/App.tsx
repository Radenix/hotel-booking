import { useEffect, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from './store/hooks'
import {
  updateConfig,
  updateBoardType,
  type ConfigKey,
} from './store/slices/tripConfigSlice'
import {
  updateHotel,
  updateMeal,
  clearMeals,
  syncWithDates,
} from './store/slices/dailySelectionsSlice'
import { setLoading } from './store/slices/loadingSlice'
import {
  boardTypes,
  countries,
  hotelsByCountry,
  mealsByCountry,
  type BoardType,
} from './data'
import type { TripConfig } from './store/slices/tripConfigSlice'

type BoardCode = BoardType['code']

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)

const formatDisplayDate = (isoDate: string) => {
  if (!isoDate) return '-'
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

const buildTripDates = (startDate: string, days: number) => {
  if (!startDate || days < 1) return []
  const parsed = new Date(startDate)
  if (Number.isNaN(parsed.getTime())) return []

  return Array.from({ length: days }, (_, index) => {
    const nextDate = new Date(parsed)
    nextDate.setDate(parsed.getDate() + index)
    return nextDate.toISOString().split('T')[0]
  })
}

function App() {
  const dispatch = useAppDispatch()
  const config = useAppSelector((state) => state.tripConfig)
  const dailySelections = useAppSelector((state) => state.dailySelections)
  const { isLoading, loadingMessage } = useAppSelector((state) => state.loading)

  const tripDates = useMemo(
    () => buildTripDates(config.startDate, config.days),
    [config.startDate, config.days],
  )

  // Simulate loading when trip dates change
  useEffect(() => {
    if (tripDates.length > 0) {
      dispatch(setLoading({ isLoading: true, message: 'Loading trip data...' }))
      const timer = setTimeout(() => {
        dispatch(setLoading({ isLoading: false }))
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [tripDates, dispatch])

  useEffect(() => {
    dispatch(syncWithDates(tripDates))
  }, [tripDates, dispatch])

  const availableHotels = hotelsByCountry[config.destination] ?? []
  const mealOptions = mealsByCountry[config.destination]
  const boardMeta = boardTypes.find((type) => type.code === config.boardType)

  const handleConfigChange = <K extends ConfigKey>(
    key: K,
    value: TripConfig[K],
  ) => {
    dispatch(updateConfig({ key, value }))
  }

  const handleBoardChange = (code: BoardCode) => {
    if (code === config.boardType) return
    dispatch(updateBoardType(code))

    if (code === 'NB') {
      dispatch(clearMeals(tripDates))
    }
  }

  const handleHotelChange = (date: string, hotelId?: number) => {
    dispatch(updateHotel({ date, hotelId }))
  }

  const handleMealChange = (
    date: string,
    field: 'lunchId' | 'dinnerId',
    mealId?: number,
  ) => {
    if (config.boardType === 'NB') return

    dispatch(updateMeal({ date, field, mealId }))

    // Handle HB logic: if one meal is selected, clear the other
    if (mealId && config.boardType === 'HB') {
      const otherField = field === 'lunchId' ? 'dinnerId' : 'lunchId'
      dispatch(updateMeal({ date, field: otherField, mealId: undefined }))
    }
  }

  const dailyBreakdown = tripDates.map((date) => {
    const selection = dailySelections[date] ?? {}
    const hotel = availableHotels.find((item) => item.id === selection.hotelId)
    const lunch = mealOptions?.lunch.find((item) => item.id === selection.lunchId)
    const dinner = mealOptions?.dinner.find(
      (item) => item.id === selection.dinnerId,
    )
    const subtotal =
      (hotel?.price ?? 0) + (lunch?.price ?? 0) + (dinner?.price ?? 0)

    return { date, hotel, lunch, dinner, subtotal }
  })

  const grandTotal = dailyBreakdown.reduce(
    (acc, entry) => acc + entry.subtotal,
    0,
  )

  const disableMeals = config.boardType === 'NB'

  const selectionSummaryMissing =
    dailyBreakdown.filter((entry) => !entry.hotel).length > 0

  return (
    <main className="max-w-6xl mx-auto flex flex-col gap-7 px-4 py-8 pb-16">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 animate-scaleIn">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg font-semibold text-slate-800">
              {loadingMessage || 'Loading...'}
            </p>
          </div>
        </div>
      )}

      <header className="bg-gradient-to-br from-slate-900 to-blue-700 text-slate-50 p-8 rounded-3xl flex flex-col md:flex-row justify-between gap-8 items-start animate-slideDown">
        <div>
          <p className="uppercase text-xs tracking-widest text-slate-300 mb-2">
            Frontend Technical Assessment
          </p>
          <h1 className="text-4xl font-bold m-0 mb-2">Hotel Booking Planner</h1>
          <p className="text-base text-slate-200/85 mt-2 max-w-[520px]">
            Configure destinations, plan daily stays, and keep pricing under
            control with live feedback.
          </p>
        </div>
        <div className="bg-slate-900/35 p-6 rounded-2xl text-right min-w-[200px] animate-pulse-once">
          <p className="text-sm text-slate-300 mb-2">Total Trip</p>
          <strong className="text-3xl block my-2 text-white">
            {formatCurrency(grandTotal)}
          </strong>
          <small className="text-xs text-slate-300">
            {tripDates.length} day{tripDates.length === 1 ? '' : 's'} planned
          </small>
        </div>
      </header>

      <section className="bg-white rounded-3xl p-6 shadow-xl border border-slate-900/5 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <p className="uppercase text-xs tracking-widest text-slate-400 mb-2">
              Step 1
            </p>
            <h2 className="text-2xl font-bold text-slate-900 m-0">
              Trip configuration
            </h2>
          </div>
          {boardMeta && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium">
              {boardMeta.name} · {boardMeta.description}
            </span>
          )}
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
          <label className="flex flex-col gap-2 text-sm text-slate-900 font-semibold">
            <span>Citizenship</span>
            <select
              className="rounded-xl border border-blue-200 p-2.5 text-base font-normal bg-slate-50 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
              value={config.citizenship}
              onChange={(event) =>
                handleConfigChange('citizenship', event.target.value)
              }
            >
              <option value="">Select citizenship</option>
              {countries.map((country) => (
                <option key={country.id} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-900 font-semibold">
            <span>Start date</span>
            <input
              type="date"
              className="rounded-xl border border-blue-200 p-2.5 text-base font-normal bg-slate-50 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
              value={config.startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={(event) =>
                handleConfigChange('startDate', event.target.value)
              }
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-900 font-semibold">
            <span>Number of days</span>
            <input
              type="number"
              min={1}
              max={30}
              className="rounded-xl border border-blue-200 p-2.5 text-base font-normal bg-slate-50 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
              value={config.days}
              onChange={(event) =>
                handleConfigChange('days', Number(event.target.value) || 1)
              }
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-slate-900 font-semibold">
            <span>Destination</span>
            <select
              className="rounded-xl border border-blue-200 p-2.5 text-base font-normal bg-slate-50 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20"
              value={config.destination}
              onChange={(event) =>
                handleConfigChange('destination', event.target.value)
              }
            >
              {countries.map((country) => (
                <option key={country.id} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className="mt-6 border-none flex flex-wrap gap-3 p-0">
          <legend className="w-full mb-3 font-semibold text-slate-900">
            Board types
          </legend>
          {boardTypes.map((type) => (
            <label
              key={type.code}
              className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl border border-slate-900/10 cursor-pointer flex-1 min-w-[200px] bg-slate-50 transition-all duration-200 hover:bg-slate-100 hover:shadow-md"
            >
              <input
                type="radio"
                name="boardType"
                value={type.code}
                checked={config.boardType === type.code}
                onChange={() => handleBoardChange(type.code)}
                className="w-[18px] h-[18px] accent-blue-700"
              />
              <span className="flex flex-col gap-1">
                <strong className="text-slate-900">{type.name}</strong>
                <small className="text-slate-500 font-normal">
                  {type.description}
                </small>
              </span>
            </label>
          ))}
        </fieldset>
      </section>

      <section className="bg-white rounded-3xl p-6 shadow-xl border border-slate-900/5 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
          <div>
            <p className="uppercase text-xs tracking-widest text-slate-400 mb-2">
              Step 2
            </p>
            <h2 className="text-2xl font-bold text-slate-900 m-0">
              Daily planning
            </h2>
          </div>
          {selectionSummaryMissing && (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-medium animate-pulse">
              Pick a hotel for each day
            </span>
          )}
        </div>

        {tripDates.length === 0 ? (
          <p className="text-slate-400 mt-4">
            Select a valid start date and trip length to begin planning.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-spacing-0 hidden md:table">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-3 px-4 first:rounded-tl-2xl last:rounded-tr-2xl">
                    Date
                  </th>
                  <th className="text-left p-3 px-4">Hotel</th>
                  <th className="text-left p-3 px-4">Lunch</th>
                  <th className="text-left p-3 px-4">Dinner</th>
                  <th className="text-left p-3 px-4">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {dailyBreakdown.map((entry, index) => (
                  <tr
                    key={entry.date}
                    className="bg-white border-b border-slate-200 transition-all duration-200 hover:bg-slate-50 animate-slideIn"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <td className="p-3 px-4">
                      <span className="font-semibold text-slate-900">
                        {formatDisplayDate(entry.date)}
                      </span>
                    </td>
                    <td className="p-3 px-4">
                      <select
                        className="w-full rounded-xl border border-blue-200 p-2 text-sm bg-slate-50 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        value={entry.hotel?.id ?? ''}
                        onChange={(event) =>
                          handleHotelChange(
                            entry.date,
                            event.target.value
                              ? Number(event.target.value)
                              : undefined,
                          )
                        }
                      >
                        <option value="">Select hotel</option>
                        {availableHotels.map((hotel) => (
                          <option key={hotel.id} value={hotel.id}>
                            {hotel.name} ({formatCurrency(hotel.price)})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 px-4">
                      <select
                        disabled={disableMeals}
                        className="w-full rounded-xl border border-blue-200 p-2 text-sm bg-slate-50 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={entry.lunch?.id ?? ''}
                        onChange={(event) =>
                          handleMealChange(
                            entry.date,
                            'lunchId',
                            event.target.value
                              ? Number(event.target.value)
                              : undefined,
                          )
                        }
                      >
                        <option value="">
                          {disableMeals ? 'No board' : 'Select lunch'}
                        </option>
                        {mealOptions?.lunch.map((meal) => (
                          <option key={meal.id} value={meal.id}>
                            {meal.name} ({formatCurrency(meal.price)})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 px-4">
                      <select
                        disabled={disableMeals}
                        className="w-full rounded-xl border border-blue-200 p-2 text-sm bg-slate-50 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={entry.dinner?.id ?? ''}
                        onChange={(event) =>
                          handleMealChange(
                            entry.date,
                            'dinnerId',
                            event.target.value
                              ? Number(event.target.value)
                              : undefined,
                          )
                        }
                      >
                        <option value="">
                          {disableMeals ? 'No board' : 'Select dinner'}
                        </option>
                        {mealOptions?.dinner.map((meal) => (
                          <option key={meal.id} value={meal.id}>
                            {meal.name} ({formatCurrency(meal.price)})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 px-4">
                      <strong className="text-slate-900">
                        {formatCurrency(entry.subtotal)}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Mobile view */}
            <div className="md:hidden space-y-4">
              {dailyBreakdown.map((entry, index) => (
                <div
                  key={entry.date}
                  className="bg-white p-4 rounded-2xl shadow-md border border-slate-200 animate-slideIn"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <div className="mb-3 pb-3 border-b border-slate-200">
                    <span className="font-semibold text-slate-900 text-lg">
                      {formatDisplayDate(entry.date)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Hotel
                      </label>
                      <select
                        className="w-full rounded-xl border border-blue-200 p-2 text-sm bg-slate-50 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        value={entry.hotel?.id ?? ''}
                        onChange={(event) =>
                          handleHotelChange(
                            entry.date,
                            event.target.value
                              ? Number(event.target.value)
                              : undefined,
                          )
                        }
                      >
                        <option value="">Select hotel</option>
                        {availableHotels.map((hotel) => (
                          <option key={hotel.id} value={hotel.id}>
                            {hotel.name} ({formatCurrency(hotel.price)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Lunch
                      </label>
                      <select
                        disabled={disableMeals}
                        className="w-full rounded-xl border border-blue-200 p-2 text-sm bg-slate-50 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={entry.lunch?.id ?? ''}
                        onChange={(event) =>
                          handleMealChange(
                            entry.date,
                            'lunchId',
                            event.target.value
                              ? Number(event.target.value)
                              : undefined,
                          )
                        }
                      >
                        <option value="">
                          {disableMeals ? 'No board' : 'Select lunch'}
                        </option>
                        {mealOptions?.lunch.map((meal) => (
                          <option key={meal.id} value={meal.id}>
                            {meal.name} ({formatCurrency(meal.price)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Dinner
                      </label>
                      <select
                        disabled={disableMeals}
                        className="w-full rounded-xl border border-blue-200 p-2 text-sm bg-slate-50 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={entry.dinner?.id ?? ''}
                        onChange={(event) =>
                          handleMealChange(
                            entry.date,
                            'dinnerId',
                            event.target.value
                              ? Number(event.target.value)
                              : undefined,
                          )
                        }
                      >
                        <option value="">
                          {disableMeals ? 'No board' : 'Select dinner'}
                        </option>
                        {mealOptions?.dinner.map((meal) => (
                          <option key={meal.id} value={meal.id}>
                            {meal.name} ({formatCurrency(meal.price)})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="pt-2 border-t border-slate-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-slate-600">
                          Subtotal:
                        </span>
                        <strong className="text-lg text-slate-900">
                          {formatCurrency(entry.subtotal)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
        <article className="bg-white rounded-3xl p-6 shadow-xl border border-slate-900/5 animate-fadeIn">
          <p className="uppercase text-xs tracking-widest text-slate-400 mb-2">
            Step 3 · Summary
          </p>
          <h2 className="text-2xl font-bold text-slate-900 m-0 mb-4">
            Configuration
          </h2>
          <ul className="list-none p-0 m-4 mt-0 flex flex-col gap-3">
            <li className="flex justify-between gap-3 text-sm text-slate-600">
              <span>Citizenship</span>
              <strong className="text-slate-900">
                {config.citizenship || '—'}
              </strong>
            </li>
            <li className="flex justify-between gap-3 text-sm text-slate-600">
              <span>Travel window</span>
              <strong className="text-slate-900">
                {tripDates.length
                  ? `${formatDisplayDate(tripDates[0])} · ${
                      tripDates.length
                    } day${tripDates.length === 1 ? '' : 's'}`
                  : '—'}
              </strong>
            </li>
            <li className="flex justify-between gap-3 text-sm text-slate-600">
              <span>Destination</span>
              <strong className="text-slate-900">{config.destination}</strong>
            </li>
            <li className="flex justify-between gap-3 text-sm text-slate-600">
              <span>Board type</span>
              <strong className="text-slate-900">{boardMeta?.name}</strong>
            </li>
          </ul>
        </article>

        <article className="bg-white rounded-3xl p-6 shadow-xl border border-slate-900/5 animate-fadeIn">
          <p className="uppercase text-xs tracking-widest text-slate-400 mb-2">
            Daily selections
          </p>
          <h2 className="text-2xl font-bold text-slate-900 m-0 mb-4">
            Plan preview
          </h2>
          <ul className="list-none p-0 m-4 mt-0 flex flex-col gap-3">
            {dailyBreakdown.map((entry) => (
              <li
                key={entry.date}
                className="flex justify-between gap-3 text-sm text-slate-600"
              >
                <div>
                  <p className="m-0 font-medium text-slate-900">
                    {formatDisplayDate(entry.date)}
                  </p>
                  <small className="text-slate-400">
                    {entry.hotel ? entry.hotel.name : 'Select hotel'}
                    {entry.lunch && ` · Lunch: ${entry.lunch.name}`}
                    {entry.dinner && ` · Dinner: ${entry.dinner.name}`}
                  </small>
                </div>
                <strong className="text-slate-900">
                  {formatCurrency(entry.subtotal)}
                </strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="bg-gradient-to-br from-indigo-700 to-blue-600 text-white rounded-3xl p-6 shadow-xl animate-fadeIn">
          <p className="uppercase text-xs tracking-widest text-white/70 mb-2">
            Pricing
          </p>
          <h2 className="text-2xl font-bold text-white m-0 mb-3">
            Total estimate
          </h2>
          <div className="text-4xl font-bold my-3 text-white">
            {formatCurrency(grandTotal)}
          </div>
          <p className="text-white/80 mt-2 text-sm">
            Total = Σ(Hotel price + selected meals) across all planned days.
          </p>
        </article>
      </section>
    </main>
  )
}

export default App
