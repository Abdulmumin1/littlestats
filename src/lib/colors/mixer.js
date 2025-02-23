import { writable } from 'svelte/store';

export let color = writable('purple');

export const colorList = {
	stone: {
		primary: '#44403c', // stone-700
		secondary: '#78716c', // stone-500
		complement: '#e7e5e4' // stone-200
	},
	red: {
		primary: '#b91c1c', // red-700
		secondary: '#ef4444', // red-500
		complement: '#fecaca' // red-200
	},
	orange: {
		primary: '#c2410c', // orange-700
		secondary: '#f97316', // orange-500
		complement: '#fed7aa' // orange-200
	},
	amber: {
		primary: '#b45309', // amber-700
		secondary: '#f59e0b', // amber-500
		complement: '#fde68a' // amber-200
	},
	yellow: {
		primary: '#a16207', // yellow-700
		secondary: '#eab308', // yellow-500
		complement: '#fef08a' // yellow-200
	},
	lime: {
		primary: '#4d7c0f', // lime-700
		secondary: '#84cc16', // lime-500
		complement: '#d9f99d' // lime-200
	},
	green: {
		primary: '#15803d', // green-700
		secondary: '#22c55e', // green-500
		complement: '#bbf7d0' // green-200
	},
	emerald: {
		primary: '#047857', // emerald-700
		secondary: '#10b981', // emerald-500
		complement: '#a7f3d0' // emerald-200
	},
	teal: {
		primary: '#0f766e', // teal-700
		secondary: '#14b8a6', // teal-500
		complement: '#99f6e4' // teal-200
	},
	cyan: {
		primary: '#0e7490', // cyan-700
		secondary: '#06b6d4', // cyan-500
		complement: '#a5f3fc' // cyan-200
	},
	sky: {
		primary: '#0369a1', // sky-700
		secondary: '#0ea5e9', // sky-500
		complement: '#bae6fd' // sky-200
	},
	blue: {
		primary: '#1d4ed8', // blue-700
		secondary: '#3b82f6', // blue-500
		complement: '#bfdbfe' // blue-200
	},
	indigo: {
		primary: '#4338ca', // indigo-700
		secondary: '#6366f1', // indigo-500
		complement: '#c7d2fe' // indigo-200
	},
	violet: {
		primary: '#6d28d9', // violet-700
		secondary: '#8b5cf6', // violet-500
		complement: '#ddd6fe' // violet-200
	},
	purple: {
		primary: '#7e22ce', // purple-700
		secondary: '#a855f7', // purple-500
		complement: '#e9d5ff' // purple-200
	},
	fuchsia: {
		primary: '#a21caf', // fuchsia-700
		secondary: '#d946ef', // fuchsia-500
		complement: '#f5d0fe' // fuchsia-200
	},
	pink: {
		primary: '#be185d', // pink-700
		secondary: '#ec4899', // pink-500
		complement: '#fbcfe8' // pink-200
	},
	rose: {
		primary: '#be123c', // rose-700
		secondary: '#f43f5e', // rose-500
		complement: '#fecdd3' // rose-200
	}
};
