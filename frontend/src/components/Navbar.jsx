import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Brain, LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group" onClick={closeMenu}>
              <div className="p-2 bg-primary-100 dark:bg-primary-500/20 rounded-xl group-hover:scale-105 transition-transform duration-300">
                <Brain className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                SmartPlanner<span className="text-primary-600 dark:text-primary-400">.</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link to="/dashboard" className={`text-sm font-medium ${location.pathname === '/dashboard' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'} transition-colors`}>Dashboard</Link>
                <Link to="/generator" className={`text-sm font-medium ${location.pathname === '/generator' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'} transition-colors`}>Generator</Link>
                <Link to="/planner" className={`text-sm font-medium ${location.pathname === '/planner' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'} transition-colors`}>Planner</Link>
                <Link to="/analytics" className={`text-sm font-medium ${location.pathname === '/analytics' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'} transition-colors`}>Analytics</Link>

                <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <span className="text-sm font-medium text-slate-500 truncate max-w-[120px]">{user.name}</span>
                  <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                  <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors">
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">Log in</Link>
                <Link to="/signup" className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-500 rounded-xl shadow-sm hover:shadow-md transition-all">Sign up</Link>
                <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-2">
                  {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
            <button onClick={toggleTheme} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 absolute w-full pb-4 shadow-lg">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link to="/dashboard" onClick={closeMenu} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800">Dashboard</Link>
                <Link to="/generator" onClick={closeMenu} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800">Generator</Link>
                <Link to="/planner" onClick={closeMenu} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800">Planner</Link>
                <Link to="/analytics" onClick={closeMenu} className="block px-3 py-2 rounded-lg text-base font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800">Analytics</Link>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="px-3 py-2 text-sm text-slate-500">Signed in as {user.email}</div>
                  <button onClick={() => { logout(); closeMenu(); }} className="mt-2 flex items-center w-full gap-2 px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <LogOut size={20} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 py-4">
                <Link to="/login" onClick={closeMenu} className="block text-center px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium hover:bg-slate-50 dark:hover:bg-slate-800">Log in</Link>
                <Link to="/signup" onClick={closeMenu} className="block text-center px-4 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-500 shadow-sm">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
