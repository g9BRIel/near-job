import { useState } from 'react';
import { X, Camera, Plus, Trash2, AlertTriangle } from 'lucide-react';

const EditProfile = ({ userType, onClose, onUpdate }) => {
  const [workerData, setWorkerData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Experienced carpenter looking for local work',
    location: 'New York, NY',
    skills: ['Carpentry', 'Painting', 'Drywall', 'Furniture Assembly'],
    pfp: null
  });

  const [companyData, setCompanyData] = useState({
    name: 'TechCorp Inc.',
    email: 'contact@techcorp.com',
    about: 'Leading technology company providing innovative solutions',
    activityType: 'Technology & Software',
    location: 'San Francisco, CA',
    phone: '+1 (555) 123-4567',
    pfp: null
  });

  const [newSkill, setNewSkill] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result;
        if (userType === 'worker') {
          setWorkerData({ ...workerData, pfp: imageData });
          if (onUpdate) {
            onUpdate({ name: workerData.name, pfp: imageData });
          }
        } else {
          setCompanyData({ ...companyData, pfp: imageData });
          if (onUpdate) {
            onUpdate({ name: companyData.name, pfp: imageData });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !workerData.skills.includes(newSkill.trim())) {
      setWorkerData({
        ...workerData,
        skills: [...workerData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setWorkerData({
      ...workerData,
      skills: workerData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleCVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCvFile(file.name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdate) {
      onUpdate({
        name: userType === 'worker' ? workerData.name : companyData.name,
        pfp: userType === 'worker' ? workerData.pfp : companyData.pfp
      });
    }
    alert('Profile updated successfully!');
    onClose();
  };

  const handleDeleteAccount = () => {
    // Add your delete account logic here (API call, etc.)
    console.log('Account deleted:', userType === 'worker' ? workerData : companyData);
    alert('Account deleted successfully. Redirecting to login...');
    // Redirect to login page or home page
    window.location.href = '/login';
  };

  const currentData = userType === 'worker' ? workerData : companyData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-6">
        <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl overflow-hidden">
                {currentData.pfp ? (
                  <img src={currentData.pfp} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  userType === 'worker' ? '👤' : '🏢'
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-1.5 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition">
                <Camera className="w-3 h-3 text-white" />
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <div className="flex-1">
              <input
                type="text"
                value={currentData.name}
                onChange={(e) => {
                  if (userType === 'worker') {
                    setWorkerData({ ...workerData, name: e.target.value });
                  } else {
                    setCompanyData({ ...companyData, name: e.target.value });
                  }
                }}
                className="text-2xl font-bold text-white bg-transparent border-b border-white/20 focus:border-blue-500 outline-none px-2 py-1 w-full"
              />
              <p className="text-gray-400 text-sm mt-1">
                {userType === 'worker' ? 'Worker • Edit your profile' : 'Company • Edit your profile'}
              </p>
            </div>

            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {userType === 'worker' ? (
            <>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <label className="block text-white font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={workerData.email}
                  onChange={(e) => setWorkerData({ ...workerData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <label className="block text-white font-semibold mb-2">Bio</label>
                <textarea
                  rows="3"
                  value={workerData.bio}
                  onChange={(e) => setWorkerData({ ...workerData, bio: e.target.value })}
                  className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <label className="block text-white font-semibold mb-2">Location</label>
                <input
                  type="text"
                  value={workerData.location}
                  onChange={(e) => setWorkerData({ ...workerData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <label className="block text-white font-semibold mb-2">Skills</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {workerData.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center gap-2">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add new skill"
                    className="flex-1 px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <button type="button" onClick={addSkill} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <label className="block text-white font-semibold mb-2">Upload CV (PDF)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleCVUpload}
                  className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
                {cvFile && <p className="text-green-400 text-sm mt-2">✅ {cvFile} uploaded</p>}
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <label className="block text-white font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={companyData.email}
                  onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <label className="block text-white font-semibold mb-2">About</label>
                <textarea
                  rows="3"
                  value={companyData.about}
                  onChange={(e) => setCompanyData({ ...companyData, about: e.target.value })}
                  className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <label className="block text-white font-semibold mb-2">Activity Type</label>
                <input
                  type="text"
                  value={companyData.activityType}
                  onChange={(e) => setCompanyData({ ...companyData, activityType: e.target.value })}
                  className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <label className="block text-white font-semibold mb-2">Location</label>
                <input
                  type="text"
                  value={companyData.location}
                  onChange={(e) => setCompanyData({ ...companyData, location: e.target.value })}
                  className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <label className="block text-white font-semibold mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={companyData.phone}
                  onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition">
              Save Changes
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition">
              Cancel
            </button>
          </div>

          {/* Delete Account Section */}
          <div className="pt-6 border-t border-red-500/30">
            <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/30">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <h3 className="text-red-500 font-semibold text-lg">Delete My Account</h3>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Once you delete your account, there is no going back. All your data will be permanently removed.
              </p>
              {!showDeleteConfirm ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
                >
                  Delete Account
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-white text-sm">Are you absolutely sure? This action cannot be undone.</p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
                    >
                      Yes, delete my account
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;